import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'
import { mkdir } from 'node:fs/promises'

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
      // ✅ ดึงค่าจาก body แบบตรงๆ (Manual Extraction)
      const { 
        email, firstName, lastName, phone, nationalId, 
        roomId, startDate, agreedBaseRent, 
        initialElectricity, initialWater,
        idCardFile 
      } = body

      // ✅ 1. ตรวจสอบข้อมูลเบื้องต้น (แทนที่ระบบอัตโนมัติที่พัง)
      if (!email || !firstName || !roomId) {
        set.status = 400
        return { error: 'Missing required fields (Email, Name, or Room)' }
      }

      // 2. ตรวจสอบห้อง
      const room = await prisma.room.findUnique({ where: { id: roomId } })
      if (!room || room.status !== 'VACANT') {
        set.status = 400
        return { error: 'Room is not available' }
      }

      // 3. จัดการไฟล์รูป (idCardFile)
      let idCardUrl = null
      if (idCardFile && idCardFile instanceof File) {
        try {
          const uploadDir = './uploads/id-cards'
          await mkdir(uploadDir, { recursive: true })
          const fileName = `${Date.now()}-${nationalId}.png`
          await Bun.write(`${uploadDir}/${fileName}`, idCardFile)
          idCardUrl = `/uploads/id-cards/${fileName}`
        } catch (err) {
          console.error("File save error:", err)
        }
      }

      // 4. เตรียม Password และบันทึกข้อมูล
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await hash(tempPassword, 10)

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, password: hashedPassword, role: 'TENANT' }
        })

        const tenant = await tx.tenant.create({
          data: {
            userId: user.id,
            firstName, lastName, phone, nationalId,
            idCardUrl // บันทึก Path รูป
          }
        })

        await tx.lease.create({
          data: {
            roomId,
            tenantId: tenant.id,
            startDate: new Date(startDate),
            agreedBaseRent: Number(agreedBaseRent || room.pricePerMonth),
            status: 'ACTIVE',
          }
        })

        const monthLabel = new Date().toISOString().slice(0, 7)
        await tx.meterReading.createMany({
          data: [
            { roomId, month: monthLabel, utilityType: 'ELECTRICITY', previousValue: Number(initialElectricity || 0), currentValue: Number(initialElectricity || 0), usage: 0, rateAtTime: 8 },
            { roomId, month: monthLabel, utilityType: 'WATER', previousValue: Number(initialWater || 0), currentValue: Number(initialWater || 0), usage: 0, rateAtTime: 20 },
          ]
        })

        await tx.room.update({
          where: { id: roomId },
          data: { status: 'OCCUPIED' }
        })

        return { tempPassword }
      })

      return { success: true, tempPassword: result.tempPassword }
    } catch (error) {
      console.error("Registration Error:", error)
      set.status = 500
      return { error: 'Database error. Check if Email or ID is duplicate.' }
    }
  }, {
    // ✅ หัวใจสำคัญ: ใช้ t.Any() เพื่อข้ามด่านตรวจ 422
    body: t.Any() 
  })
  
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
