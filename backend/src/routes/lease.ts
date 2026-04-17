import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'

export const leaseRoutes = new Elysia({ prefix: '/api/leases' })
  .get('/', async () => {
    return await prisma.lease.findMany({
      include: {
        room: true,
        tenant: true
      },
      orderBy: { createdAt: 'desc' }
    })
  })
  // Move-out
  .post('/:id/terminate', async ({ params }) => {
    return await prisma.$transaction(async (tx) => {
      const lease = await tx.lease.update({
        where: { id: params.id },
        data: { 
          status: 'TERMINATED',
          endDate: new Date()
        },
        include: { tenant: true } 
      })
      
      await tx.room.update({
        where: { id: lease.roomId },
        data: { status: 'VACANT' }
      })

      if (lease.tenant && lease.tenant.userId) {
        await tx.user.update({
          where: { id: lease.tenant.userId },
          data: { isActive: false }
        })
      }

      return { success: true }
    })
  })