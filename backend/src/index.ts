import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { roomRoutes } from './routes/rooms'
import { tenantRoutes } from './routes/tenants'
import { meterRoutes } from './routes/meters'
import { invoiceRoutes } from './routes/invoices'
import { paymentRoutes } from './routes/payments'
import { authRoutes } from './routes/auth'
import { maintenanceRoutes } from './routes/maintenance'
import { userRoutes } from './routes/users'
import { statsRoutes } from './routes/stats'
import { leaseRoutes } from './routes/lease'

const port = process.env.PORT || 3001

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }))
  .get('/', () => ({ 
    message: 'Apartment Management API', 
    version: '2.0.0',
    features: [
      'RBAC Authentication (Admin, Tenant, Technician)',
      'Room & Lease Management',
      'Meter Reading & Billing',
      'Invoice Generation',
      'Payment Verification',
      'Maintenance Request System',
    ]
  }))
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .use(authRoutes)
  .use(roomRoutes)
  .use(tenantRoutes)
  .use(userRoutes)
  .use(meterRoutes)
  .use(invoiceRoutes)
  .use(paymentRoutes)
  .use(maintenanceRoutes)
  .use(statsRoutes)
  .use(leaseRoutes)
  .listen(port)

console.log(`Server running at http://localhost:${port}`)

export type App = typeof app
