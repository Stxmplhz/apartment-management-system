import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { InvoiceStatus } from '@prisma/client'

export const invoiceRoutes = new Elysia({ prefix: '/api/invoices' })
  // Get all invoices
  .get('/', async ({ query }) => {
    const { status, month, leaseId } = query
    const where: any = {}
    if (status) where.status = status as InvoiceStatus
    if (month) where.month = month
    if (leaseId) where.leaseId = leaseId

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        lease: {
          include: { room: true, tenant: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const enrichedInvoices = await Promise.all(invoices.map(async (inv) => {
      const readings = await prisma.meterReading.findMany({
        where: {
          roomId: inv.lease.roomId,
          month: inv.month 
        }
      })

      const elecUsage = readings.find(r => r.utilityType === 'ELECTRICITY')?.usage || 0
      const waterUsage = readings.find(r => r.utilityType === 'WATER')?.usage || 0

      return {
        ...inv,
        electricityUsage: elecUsage, 
        waterUsage: waterUsage
      }
    }))

    return enrichedInvoices
  })
  
  // Get single invoice
  .get('/:id', async ({ params }) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        lease: {
          include: {
            room: true,
            tenant: {
              include: {
                user: { select: { email: true } }
              }
            },
          },
        },
        payments: true,
      },
    })
    
    if (!invoice) {
      return { error: 'Invoice not found' }
    }
    
    return invoice
  })
  
  // Generate invoice from meter readings (UC-08)
  .post('/generate', async ({ body }) => {
    const { roomId, month, monthDisplay, dueDate } = body
    
    // Get active lease for the room
    const lease = await prisma.lease.findFirst({
      where: {
        roomId,
        status: 'ACTIVE',
      },
      include: {
        room: true,
        tenant: true,
      },
    })
    
    if (!lease) {
      return { error: 'No active lease found for this room' }
    }
    
    // Check if invoice already exists for this lease and month
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        leaseId: lease.id,
        month: monthDisplay || month,
      },
    })
    
    // Get meter readings for the month
    const meterReadings = await prisma.meterReading.findMany({
      where: {
        roomId,
        month,
      },
    })
    
    const elecReading = meterReadings.find(r => r.utilityType === 'ELECTRICITY')
    const waterReading = meterReadings.find(r => r.utilityType === 'WATER')
    
    if (!elecReading || !waterReading) {
      return { error: 'Meter readings not found for this month' }
    }
    
    // Calculate costs
    const electricityCost = elecReading.usage * elecReading.rateAtTime
    const waterCost = waterReading.usage * waterReading.rateAtTime
    const baseRent = lease.agreedBaseRent
    const totalAmount = baseRent + electricityCost + waterCost
    
    if (existingInvoice) {
      if (existingInvoice.status === 'PAID') {
        return { error: 'Cannot regenerate a PAID invoice' }
      }
      
      // Update existing invoice instead of returning error
      const updatedInvoice = await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          electricityCost,
          waterCost,
          totalAmount: baseRent + electricityCost + waterCost + (existingInvoice.otherCharges || 0),
        },
        include: {
          lease: {
            include: {
              room: true,
              tenant: true,
            },
          },
        },
      })
      
      return updatedInvoice
    }
    
    // Generate invoice number
    const year = new Date().getFullYear()
    const count = await prisma.invoice.count({
      where: {
        invoiceNumber: { startsWith: `INV-${year}` }
      }
    })
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`
    
    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        leaseId: lease.id,
        month: monthDisplay || month,
        baseRent,
        electricityCost,
        waterCost,
        totalAmount,
        status: 'UNPAID',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        lease: {
          include: {
            room: true,
            tenant: true,
          },
        },
      },
    })
    
    return invoice
  }, {
    body: t.Object({
      roomId: t.String(),
      month: t.String(), // Format: "2024-03"
      monthDisplay: t.Optional(t.String()), // Format: "March 2024"
      dueDate: t.Optional(t.String()),
    }),
  })
  
  // Create invoice manually
  .post('/', async ({ body }) => {
    const year = new Date().getFullYear()
    const count = await prisma.invoice.count({
      where: {
        invoiceNumber: { startsWith: `INV-${year}` }
      }
    })
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`
    
    const totalAmount = body.baseRent + body.electricityCost + body.waterCost + (body.otherCharges || 0)
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        leaseId: body.leaseId,
        month: body.month,
        baseRent: body.baseRent,
        electricityCost: body.electricityCost,
        waterCost: body.waterCost,
        otherCharges: body.otherCharges || 0,
        totalAmount,
        status: 'UNPAID',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
      include: {
        lease: {
          include: { room: true, tenant: true },
        },
      },
    })
    
    return invoice
  }, {
    body: t.Object({
      leaseId: t.String(),
      month: t.String(),
      baseRent: t.Number(),
      electricityCost: t.Number(),
      waterCost: t.Number(),
      otherCharges: t.Optional(t.Number()),
      dueDate: t.Optional(t.String()),
    }),
  })
  
  // Update invoice status
  .put('/:id', async ({ params, body }) => {
    const updateData: any = {}
    if (body.status) updateData.status = body.status as InvoiceStatus
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate)
    if (body.otherCharges !== undefined) {
      updateData.otherCharges = body.otherCharges
      // Recalculate total
      const existing = await prisma.invoice.findUnique({ where: { id: params.id } })
      if (existing) {
        updateData.totalAmount = existing.baseRent + existing.electricityCost + existing.waterCost + body.otherCharges
      }
    }
    
    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        lease: {
          include: { room: true, tenant: true },
        },
      },
    })
    return invoice
  }, {
    body: t.Object({
      status: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
      otherCharges: t.Optional(t.Number()),
    }),
  })
  
  // Bulk generate invoices for all active leases (UC-08 Extension)
  .post('/generate-all', async ({ body }) => {
    const { month, monthDisplay, dueDate } = body
    
    // 1. Get all active leases
    const activeLeases = await prisma.lease.findMany({
      where: { status: 'ACTIVE' },
      include: { room: true, tenant: true }
    })
    
    let createdCount = 0
    let skippedCount = 0
    let errors: string[] = []
    
    const results = await Promise.all(activeLeases.map(async (lease) => {
      try {
        // Check if invoice already exists
        const existing = await prisma.invoice.findFirst({
          where: { leaseId: lease.id, month: monthDisplay || month }
        })
        
        if (existing) {
          skippedCount++
          return { roomId: lease.room.number, status: 'SKIPPED', reason: 'Already exists' }
        }
        
        // Get meter readings
        const meterReadings = await prisma.meterReading.findMany({
          where: { roomId: lease.roomId, month }
        })
        
        const elecReading = meterReadings.find(r => r.utilityType === 'ELECTRICITY')
        const waterReading = meterReadings.find(r => r.utilityType === 'WATER')
        
        if (!elecReading || !waterReading) {
          skippedCount++
          return { roomId: lease.room.number, status: 'SKIPPED', reason: 'Missing readings' }
        }
        
        // Calculate costs
        const electricityCost = elecReading.usage * elecReading.rateAtTime
        const waterCost = waterReading.usage * waterReading.rateAtTime
        const baseRent = lease.agreedBaseRent
        const totalAmount = baseRent + electricityCost + waterCost
        
        // Generate number
        const year = new Date().getFullYear()
        const count = await prisma.invoice.count({
          where: { invoiceNumber: { startsWith: `INV-${year}` } }
        })
        const invoiceNumber = `INV-${year}-${String(count + createdCount + 1).padStart(4, '0')}`
        
        await prisma.invoice.create({
          data: {
            invoiceNumber,
            leaseId: lease.id,
            month: monthDisplay || month,
            baseRent,
            electricityCost,
            waterCost,
            totalAmount,
            status: 'UNPAID',
            dueDate: dueDate ? new Date(dueDate) : null,
          }
        })
        
        createdCount++
        return { roomId: lease.room.number, status: 'CREATED' }
      } catch (err: any) {
        errors.push(`Room ${lease.room.number}: ${err.message}`)
        return { roomId: lease.room.number, status: 'ERROR', message: err.message }
      }
    }))
    
    return {
      success: true,
      summary: {
        totalProcessed: activeLeases.length,
        created: createdCount,
        skipped: skippedCount,
        errors: errors.length
      },
      details: results
    }
  }, {
    body: t.Object({
      month: t.String(),
      monthDisplay: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
    })
  })
  
  // Delete invoice
  .delete('/:id', async ({ params }) => {
    // Check if invoice has payments
    const payments = await prisma.payment.count({
      where: { invoiceId: params.id }
    })
    
    if (payments > 0) {
      return { error: 'Cannot delete invoice with payments' }
    }
    
    await prisma.invoice.delete({
      where: { id: params.id },
    })
    
    return { success: true }
  })
