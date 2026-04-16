import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .get('/', async () => {
    return await prisma.user.findMany({
      include: {
        tenantProfile: true,
        techProfile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: 'desc' }
    })
  })
  .put('/:id/status', async ({ params, body }) => {
    return await prisma.user.update({
      where: { id: params.id },
      data: { isActive: body.isActive }
    })
  }, {
    body: t.Object({ isActive: t.Boolean() })
  })