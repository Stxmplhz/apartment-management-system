import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'
import cloudinary from '../lib/cloudinary'

export const tenantRoutes = new Elysia({ prefix: '/api/tenants' })
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      console.error("❌ Validation Error Details:", error.all);
      set.status = 422;
      
      const simplifiedDetails = error.all.map((err) => ({
        path: err.path,
        message: err.message,
        value: err.value
      }));

      return { 
        error: 'Validation failed', 
        details: simplifiedDetails 
      };
    }
  })

  // Get all tenants
  .get('/', async () => {
    const tenants = await prisma.tenant.findMany({
      include: {
        user: {
          select: { email: true, isActive: true, role: true }
        },
        leases: {
          include: { room: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return tenants.map(tenant => ({
      ...tenant,
      currentLease: tenant.leases.find(l => l.status === 'ACTIVE') || null,
      currentRoom: tenant.leases.find(l => l.status === 'ACTIVE')?.room || null,
    }))
  })
  
  // Get single tenant
  .get('/:id', async ({ params }) => {
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { email: true, isActive: true, role: true }
        },
        leases: {
          include: {
            room: true,
            invoices: {
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          include: { invoice: true },
          orderBy: { createdAt: 'desc' },
        },
        requests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    
    if (!tenant) {
      return { error: 'Tenant not found' }
    }
    
    return {
      ...tenant,
      currentLease: tenant.leases.find(l => l.status === 'ACTIVE') || null,
    }
  })
  
  // Create tenant with Move-in (UC-01)
  .post('/move-in', async ({ body, set }) => {
    try {
      console.log("📥 [System] Received Move-in Request for:", body.email);

      const { 
        email, firstName, lastName, phone, nationalId, 
        roomId, startDate, endDate, agreedBaseRent, 
        initialElectricity, initialWater,
        idCardFile, contractFile 
      } = body

      const rentVal = parseFloat(agreedBaseRent) || 0;
      const elecVal = parseFloat(initialElectricity) || 0;
      const waterVal = parseFloat(initialWater) || 0;

      if (!idCardFile || !contractFile) {
        set.status = 400;
        return { error: 'Please upload both your ID card and rental agreement.' };
      }

      const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        
        formData.append("upload_preset", "apartment_preset");
        formData.append("folder", folder);

        const response = await fetch("https://api.cloudinary.com/v1_1/dwho7vbl5/image/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`❌ [Cloudinary Fetch Error] ${folder}:`, data);
          throw new Error(data.error?.message || "Cloudinary upload failed");
        }

        console.log(`✅ [Cloudinary] ${folder} Uploaded:`, data.secure_url);
        return data.secure_url;
      };

      console.log("☁️ [System] Uploading documents to Cloudinary...");
      const idCardUrl = await uploadToCloudinary(idCardFile, 'apartment_id_cards');
      const contractUrl = await uploadToCloudinary(contractFile, 'apartment_contracts');

      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await hash(tempPassword, 10)

      console.log("💾 [System] Starting DB Transaction...");
      const result = await prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({ where: { email } })
        if (user) {
          user = await tx.user.update({ where: { id: user.id }, data: { isActive: true, role: 'TENANT' } })
        } else {
          user = await tx.user.create({ data: { email, password: hashedPassword, role: 'TENANT' } })
        }

        const tenant = await tx.tenant.upsert({
          where: { nationalId },
          update: { firstName, lastName, phone, idCardUrl, userId: user.id },
          create: { userId: user.id, firstName, lastName, phone, nationalId, idCardUrl }
        });

        await tx.lease.create({
          data: {
            roomId,
            tenantId: tenant.id,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            contractUrl,
            agreedBaseRent: rentVal,
            status: 'ACTIVE',
          }
        })

        const monthLabel = new Date().toISOString().slice(0, 7)
        const meters = [
          { type: 'ELECTRICITY' as const, val: elecVal, rate: 8 },
          { type: 'WATER' as const, val: waterVal, rate: 20 }
        ]

        for (const m of meters) {
          await tx.meterReading.upsert({
            where: { roomId_month_utilityType: { roomId, month: monthLabel, utilityType: m.type } },
            update: { previousValue: m.val, currentValue: m.val },
            create: { 
              roomId, 
              month: monthLabel, 
              utilityType: m.type, 
              previousValue: m.val, 
              currentValue: m.val, 
              usage: 0, 
              rateAtTime: m.rate 
            }
          })
        }

        await tx.room.update({ where: { id: roomId }, data: { status: 'OCCUPIED' } })

        return { tempPassword }
      })

      return { success: true, tempPassword: result.tempPassword }

    } catch (error: any) {
      console.error("🚨 [Critical Error] Move-in Failed:", error.message);
      set.status = 500
      return { error: `Registration failed: ${error.message}` }
    }
  }, { body: t.Any() })
  
  // Update tenant
  .put('/:id', async ({ params, body }) => {
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
      },
    })
    return tenant
  }, {
    body: t.Object({
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      phone: t.Optional(t.String()),
    }),
  })
  
  // Process Move-out (UC-05)
  .post('/:id/move-out', async ({ params }) => {
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          include: { room: true },
        },
        user: true,
      }
    })
    
    if (!tenant) {
      return { error: 'Tenant not found' }
    }
    
    const activeLease = tenant.leases[0]
    if (!activeLease) {
      return { error: 'No active lease found' }
    }
    
    // Transaction: terminate lease, update room, deactivate user
    await prisma.$transaction(async (tx) => {
      // Terminate lease
      await tx.lease.update({
        where: { id: activeLease.id },
        data: {
          status: 'TERMINATED',
          endDate: new Date(),
        }
      })
      
      // Update room status
      await tx.room.update({
        where: { id: activeLease.roomId },
        data: { status: 'VACANT' }
      })
      
      // Deactivate user account
      await tx.user.update({
        where: { id: tenant.userId },
        data: { isActive: false }
      })
    })
    
    return { success: true, message: 'Move-out processed successfully' }
  })
