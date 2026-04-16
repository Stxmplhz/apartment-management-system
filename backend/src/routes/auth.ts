import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { compare, hash } from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  // Login (UC-02)
  .post('/login', async ({ body }) => {
    const { email, password } = body
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        adminProfile: true,
        tenantProfile: true,
        techProfile: true,
      },
    })
    
    if (!user) {
      return { error: 'Invalid username or password' }
    }
    
    // Check if account is active
    if (!user.isActive) {
      return { error: 'Your account is no longer active. Please contact the management office.' }
    }
    
    // Verify password
    const isValid = await compare(password, user.password)
    if (!isValid) {
      return { error: 'Invalid username or password' }
    }
    
    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Get profile based on role
    let profile = null
    if (user.role === 'ADMIN' && user.adminProfile) {
      profile = user.adminProfile
    } else if (user.role === 'TENANT' && user.tenantProfile) {
      profile = await prisma.tenant.findUnique({
        where: { id: user.tenantProfile.id },
        include: {
          leases: {
            where: { status: 'ACTIVE' },
            include: { room: true },
          },
        },
      })
    } else if (user.role === 'TECHNICIAN' && user.techProfile) {
      profile = user.techProfile
    }
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile,
      },
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })
  
  // Logout (UC-03)
  .post('/logout', async () => {
    // In a stateless JWT system, logout is handled client-side
    // Server-side could maintain a blacklist if needed
    return { success: true, message: 'Logged out successfully' }
  })
  
  // Get current user
  .get('/me', async ({ headers }) => {
    const authHeader = headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Unauthorized' }
    }
    
    const token = authHeader.slice(7)
    
    try {
      const decoded = verify(token, JWT_SECRET) as { userId: string; role: string }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          adminProfile: true,
          tenantProfile: {
            include: {
              leases: {
                where: { status: 'ACTIVE' },
                include: { room: true },
              },
            },
          },
          techProfile: true,
        },
      })
      
      if (!user || !user.isActive) {
        return { error: 'User not found or inactive' }
      }
      
      let profile = null
      if (user.role === 'ADMIN') profile = user.adminProfile
      else if (user.role === 'TENANT') profile = user.tenantProfile
      else if (user.role === 'TECHNICIAN') profile = user.techProfile
      
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile,
      }
    } catch {
      return { error: 'Invalid token' }
    }
  })
  
  // Change password
  .post('/change-password', async ({ headers, body }) => {
    const authHeader = headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Unauthorized' }
    }
    
    const token = authHeader.slice(7)
    
    try {
      const decoded = verify(token, JWT_SECRET) as { userId: string }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })
      
      if (!user) {
        return { error: 'User not found' }
      }
      
      // Verify current password
      const isValid = await compare(body.currentPassword, user.password)
      if (!isValid) {
        return { error: 'Current password is incorrect' }
      }
      
      // Hash new password
      const hashedPassword = await hash(body.newPassword, 10)
      
      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })
      
      return { success: true, message: 'Password changed successfully' }
    } catch {
      return { error: 'Invalid token' }
    }
  }, {
    body: t.Object({
      currentPassword: t.String(),
      newPassword: t.String(),
    }),
  })

  // Register Technician
  .post('/register-technician', async ({ body }) => {
  const { email, password, firstName, lastName, phone, expertise } = body
  
  const hashedPassword = await hash(password, 10)
  
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'TECHNICIAN',
      techProfile: {
        create: {
          expertise,
        }
      }
    }
  })
  
  return { success: true, userId: newUser.id }
}, {
  body: t.Object({
    email: t.String(),
    password: t.String(),
    firstName: t.String(),
    lastName: t.String(),
    phone: t.String(),
    expertise: t.Optional(t.String()),
  })
})
