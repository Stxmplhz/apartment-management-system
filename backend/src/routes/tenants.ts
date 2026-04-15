import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

export const tenantRoutes = new Elysia({ prefix: '/api/tenants' })
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
  .post('/move-in', async ({ body }) => {
    // Validate room is vacant
    const room = await prisma.room.findUnique({
      where: { id: body.roomId }
    })
    
    if (!room) {
      return { error: 'Room not found' }
    }
    
    if (room.status !== 'VACANT') {
      return { error: 'Room is currently occupied' }
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await hash(tempPassword, 10)
    
    // Transaction: create user, tenant, lease, initial meter readings, update room
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          role: 'TENANT',
          isActive: true,
        }
      })
      
      // Create tenant profile
      const tenant = await tx.tenant.create({
        data: {
          userId: user.id,
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          nationalId: body.nationalId,
        }
      })
      
      // Create lease
      const lease = await tx.lease.create({
        data: {
          roomId: body.roomId,
          tenantId: tenant.id,
          startDate: new Date(body.startDate),
          agreedBaseRent: body.agreedBaseRent || room.pricePerMonth,
          status: 'ACTIVE',
        }
      })
      
      // Record initial meter readings (MOVE_IN type)
      const month = new Date().toISOString().slice(0, 7) // "2024-03"
      
      await tx.meterReading.createMany({
        data: [
          {
            roomId: body.roomId,
            month,
            utilityType: 'ELECTRICITY',
            previousValue: body.initialElectricity || 0,
            currentValue: body.initialElectricity || 0,
            usage: 0,
            rateAtTime: 8,
          },
          {
            roomId: body.roomId,
            month,
            utilityType: 'WATER',
            previousValue: body.initialWater || 0,
            currentValue: body.initialWater || 0,
            usage: 0,
            rateAtTime: 20,
          },
        ]
      })
      
      // Update room status
      await tx.room.update({
        where: { id: body.roomId },
        data: { status: 'OCCUPIED' }
      })
      
      return { user, tenant, lease, tempPassword }
    })
    
    return {
      success: true,
      tenant: result.tenant,
      lease: result.lease,
      tempPassword: result.tempPassword, // In production, send via email
      message: 'Tenant registered and assigned successfully',
    }
  }, {
    body: t.Object({
      // User info
      email: t.String(),
      // Tenant info
      firstName: t.String(),
      lastName: t.String(),
      phone: t.String(),
      nationalId: t.String(),
      // Lease info
      roomId: t.String(),
      startDate: t.String(),
      agreedBaseRent: t.Optional(t.Number()),
      // Initial meter readings
      initialElectricity: t.Optional(t.Number()),
      initialWater: t.Optional(t.Number()),
    }),
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
