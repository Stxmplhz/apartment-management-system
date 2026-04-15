import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { MaintenanceStatus } from '@prisma/client'

export const maintenanceRoutes = new Elysia({ prefix: '/api/maintenance' })
  // Get all maintenance requests
  .get('/', async ({ query }) => {
    const { status, roomId, tenantId, technicianId } = query
    
    const where: any = {}
    if (status) where.status = status as MaintenanceStatus
    if (roomId) where.roomId = roomId
    if (tenantId) where.tenantId = tenantId
    if (technicianId) where.technicianId = technicianId
    
    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        room: true,
        tenant: true,
        technician: {
          include: {
            user: { select: { email: true } }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return requests
  }, {
    query: t.Object({
      status: t.Optional(t.String()),
      roomId: t.Optional(t.String()),
      tenantId: t.Optional(t.String()),
      technicianId: t.Optional(t.String()),
    }),
  })
  
  // Get single maintenance request
  .get('/:id', async ({ params }) => {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
      include: {
        room: true,
        tenant: {
          include: {
            user: { select: { email: true } }
          }
        },
        technician: {
          include: {
            user: { select: { email: true } }
          }
        },
      },
    })
    
    if (!request) {
      return { error: 'Maintenance request not found' }
    }
    
    return request
  })
  
  // Submit maintenance request (UC-13 - Tenant submits)
  .post('/', async ({ body }) => {
    // Verify tenant has active lease
    const tenant = await prisma.tenant.findUnique({
      where: { id: body.tenantId },
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          include: { room: true },
        },
      },
    })
    
    if (!tenant) {
      return { error: 'Tenant not found' }
    }
    
    const activeLease = tenant.leases[0]
    if (!activeLease) {
      return { error: 'Only tenants with active lease can submit maintenance requests' }
    }
    
    const request = await prisma.maintenanceRequest.create({
      data: {
        roomId: activeLease.roomId,
        tenantId: body.tenantId,
        description: body.description,
        imageUrl: body.imageUrl,
        status: 'OPEN',
      },
      include: {
        room: true,
        tenant: true,
      },
    })
    
    return request
  }, {
    body: t.Object({
      tenantId: t.String(),
      description: t.String(),
      imageUrl: t.Optional(t.String()),
    }),
  })
  
  // Assign technician to request (Admin action)
  .put('/:id/assign', async ({ params, body }) => {
    const request = await prisma.maintenanceRequest.update({
      where: { id: params.id },
      data: {
        technicianId: body.technicianId,
        status: 'ASSIGNED',
        adminNotes: body.adminNotes,
      },
      include: {
        room: true,
        tenant: true,
        technician: {
          include: {
            user: { select: { email: true } }
          }
        },
      },
    })
    
    return request
  }, {
    body: t.Object({
      technicianId: t.String(),
      adminNotes: t.Optional(t.String()),
    }),
  })
  
  // Update request status (UC-14 - Admin/Technician updates)
  .put('/:id/status', async ({ params, body }) => {
    const validTransitions: Record<MaintenanceStatus, MaintenanceStatus[]> = {
      'OPEN': ['ASSIGNED', 'REJECTED'],
      'ASSIGNED': ['IN_PROGRESS', 'REJECTED'],
      'IN_PROGRESS': ['RESOLVED'],
      'RESOLVED': ['CLOSED'],
      'CLOSED': [],
      'REJECTED': [],
    }
    
    const current = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
    })
    
    if (!current) {
      return { error: 'Request not found' }
    }
    
    const newStatus = body.status as MaintenanceStatus
    const allowedTransitions = validTransitions[current.status]
    
    if (!allowedTransitions.includes(newStatus)) {
      return { error: `Cannot transition from ${current.status} to ${newStatus}` }
    }
    
    // Require technician assignment before IN_PROGRESS
    if (newStatus === 'IN_PROGRESS' && !current.technicianId) {
      return { error: 'Maintenance request must be assigned to a technician before marking as In Progress' }
    }
    
    const request = await prisma.maintenanceRequest.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        adminNotes: body.adminNotes || current.adminNotes,
      },
      include: {
        room: true,
        tenant: true,
        technician: true,
      },
    })
    
    return request
  }, {
    body: t.Object({
      status: t.String(),
      adminNotes: t.Optional(t.String()),
    }),
  })
  
  // Get all technicians (for assignment dropdown)
  .get('/technicians/list', async () => {
    const technicians = await prisma.technician.findMany({
      include: {
        user: {
          select: { email: true, isActive: true }
        },
        assignedJobs: {
          where: {
            status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
          },
        },
      },
    })
    
    return technicians.map(tech => ({
      ...tech,
      activeJobsCount: tech.assignedJobs.length,
    }))
  })
