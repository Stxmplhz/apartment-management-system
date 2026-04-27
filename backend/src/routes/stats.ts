import { Elysia } from 'elysia'
import { prisma } from '../lib/prisma'

export const statsRoutes = new Elysia({ prefix: '/api/stats' })
  .get('/dashboard', async () => {
    // 1. Occupancy Rate
    const totalRooms = await prisma.room.count()
    const occupiedRooms = await prisma.room.count({ where: { status: 'OCCUPIED' } })
    const vacantRooms = await prisma.room.count({ where: { status: 'VACANT' } })
    
    // 2. Revenue (Last 6 Months)
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthStr = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      const paidInvoices = await prisma.invoice.aggregate({
        where: { month: monthStr, status: 'PAID' },
        _sum: { totalAmount: true }
      })
      
      last6Months.push({
        month: monthStr,
        revenue: paidInvoices._sum.totalAmount || 0
      })
    }

    // 3. Maintenance Stats
    const openMaintenance = await prisma.maintenanceRequest.count({ where: { status: 'OPEN' } })
    const inProgressMaintenance = await prisma.maintenanceRequest.count({ where: { status: 'IN_PROGRESS' } })
    
    // 4. Recent Activities (Mocking for now or fetch real records)
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { tenant: true, invoice: true }
    })

    return {
      occupancy: {
        total: totalRooms,
        occupied: occupiedRooms,
        vacant: vacantRooms,
        rate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
      },
      revenue: last6Months,
      maintenance: {
        pending: openMaintenance + inProgressMaintenance,
        open: openMaintenance,
        inProgress: inProgressMaintenance
      },
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        tenant: `${p.tenant.firstName} ${p.tenant.lastName}`,
        amount: p.amount,
        date: p.createdAt,
        status: p.status
      }))
    }
  })
