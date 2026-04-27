import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

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
  .put('/:id/role', async ({ params, body }) => {
    return await prisma.user.update({
      where: { id: params.id },
      data: { role: body.role as any }
    })
  }, {
    body: t.Object({ role: t.String() })
  })
  .post('/:id/reset-password', async ({ params, body }) => {
    const hashedPassword = await hash(body.password, 10)
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword }
    })
    return { success: true }
  }, {
    body: t.Object({ password: t.String() })
  })