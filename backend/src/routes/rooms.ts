import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'

export const roomRoutes = new Elysia({ prefix: '/api/rooms' })
  // Get all rooms
  .get('/', async ({ query }) => {
    const { status, floor } = query
    
    const where: any = {}
    if (status) {
      where.status = (status === 'AVAILABLE') ? 'VACANT' : status
    }
    if (floor) where.floor = parseInt(floor)
    
    const rooms = await prisma.room.findMany({
      where,
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          include: {
            tenant: {
              include: {
                user: {
                  select: { email: true, isActive: true }
                }
              }
            }
          },
          take: 1,
        },
      },
      orderBy: [
        { floor: 'asc' },
        { number: 'asc' },
      ],
    })
    
    // Transform to include current tenant info
    return rooms.map(room => ({
      ...room,
      currentLease: room.leases[0] || null,
      currentTenant: room.leases[0]?.tenant || null,
    }))
  }, {
    query: t.Object({
      status: t.Optional(t.String()),
      floor: t.Optional(t.String()),
    }),
  })
  
  // Get single room with full details
  .get('/:id', async ({ params }) => {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        leases: {
          include: {
            tenant: {
              include: {
                user: { select: { email: true, isActive: true } }
              }
            },
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 6,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        meterReadings: {
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
        maintenanceJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
    
    if (!room) {
      return { error: 'Room not found' }
    }
    
    return {
      ...room,
      currentLease: room.leases.find(l => l.status === 'ACTIVE') || null,
    }
  })
  
  // Create room
  .post('/', async ({ body }) => {
    const room = await prisma.room.create({
      data: {
        ...body,
        status: body.status as any 
      },
    })
    return room
  }, {
    body: t.Object({
      number: t.String(),
      floor: t.Number(),
      pricePerMonth: t.Number(),
      status: t.Optional(t.String()),
    }),
  })
  
  // Update room
  .put('/:id', async ({ params, body }) => {
    const room = await prisma.room.update({
      where: { id: params.id },
      data: {
        ...body,
        status: body.status as any
      },
    })
    return room
  }, {
    body: t.Object({
      number: t.Optional(t.String()),
      floor: t.Optional(t.Number()),
      pricePerMonth: t.Optional(t.Number()),
      status: t.Optional(t.String()),
    }),
  })
  
  // Delete room
  .delete('/:id', async ({ params }) => {
    // Check if room has active lease
    const activeLease = await prisma.lease.findFirst({
      where: { roomId: params.id, status: 'ACTIVE' }
    })
    
    if (activeLease) {
      return { error: 'Cannot delete room with active lease' }
    }
    
    await prisma.room.delete({
      where: { id: params.id },
    })
    return { success: true }
  })
