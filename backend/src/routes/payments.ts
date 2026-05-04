import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { PaymentStatus, InvoiceStatus } from '@prisma/client'
import { sendEmail } from '../lib/email'
import { paymentVerifiedTemplate } from '../lib/email-templates'

export const paymentRoutes = new Elysia({ prefix: '/api/payments' })
  // Get all payments
  .get('/', async ({ query }) => {
    const { status, invoiceId, tenantId } = query
    
    const where: any = {}
    if (status) where.status = status as PaymentStatus
    if (invoiceId) where.invoiceId = invoiceId
    if (tenantId) where.tenantId = tenantId
    
    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            lease: {
              include: { room: true },
            },
          },
        },
        tenant: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return payments
  }, {
    query: t.Object({
      status: t.Optional(t.String()),
      invoiceId: t.Optional(t.String()),
      tenantId: t.Optional(t.String()),
    }),
  })
  
  // Get single payment
  .get('/:id', async ({ params }) => {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        invoice: {
          include: {
            lease: {
              include: { room: true, tenant: true },
            },
          },
        },
        tenant: true,
      },
    })
    
    if (!payment) {
      return { error: 'Payment not found' }
    }
    
    return payment
  })
  
  // Submit payment proof (UC-11 - Tenant uploads slip)
  .post('/', async ({ body }) => {
    // Get invoice with lease and tenant
    const invoice = await prisma.invoice.findUnique({
      where: { id: body.invoiceId },
      include: {
        lease: {
          include: { tenant: true },
        },
      },
    })
    
    if (!invoice) {
      return { error: 'Invoice not found' }
    }
    
    if (invoice.status === 'PAID') {
      return { error: 'Invoice already paid' }
    }
    
    // Create payment record
    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          invoiceId: body.invoiceId,
          tenantId: body.tenantId || invoice.lease.tenantId,
          amount: body.amount,
          slipUrl: body.slipUrl,
          status: 'PENDING',
        },
        include: {
          invoice: true,
          tenant: true,
        },
      })
      
      // Update invoice status to PENDING_VERIFY
      await tx.invoice.update({
        where: { id: body.invoiceId },
        data: { status: 'PENDING_VERIFY' },
      })
      
      return newPayment
    })
    
    return payment
  }, {
    body: t.Object({
      invoiceId: t.String(),
      tenantId: t.Optional(t.String()),
      amount: t.Number(),
      slipUrl: t.Optional(t.String()),
    }),
  })
  
  // Verify payment (UC-12 - Admin approves/rejects)
  .put('/:id/verify', async ({ params, body }) => {
    const { status } = body // 'PAID' or 'REJECTED'
    
    const payment = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: params.id },
        data: {
          status: status as PaymentStatus,
          verifiedAt: status === 'PAID' ? new Date() : null,
        },
        include: {
          invoice: true,
        },
      })
      
      // Update invoice status based on payment verification
      if (status === 'PAID') {
        await tx.invoice.update({
          where: { id: updatedPayment.invoiceId },
          data: { status: 'PAID' },
        })
      } else if (status === 'REJECTED') {
        // Revert invoice status back to UNPAID
        await tx.invoice.update({
          where: { id: updatedPayment.invoiceId },
          data: { status: 'UNPAID' },
        })
      }
      
      return updatedPayment
    })
    
    // Fetch full data for email notification
    const fullPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        tenant: { include: { user: true } },
        invoice: true
      }
    });

    if (fullPayment?.tenant?.user?.email) {
      try {
        await sendEmail({
          to: fullPayment.tenant.user.email,
          subject: `Payment ${status === 'PAID' ? 'Approved' : 'Rejected'} - ${fullPayment.invoice.invoiceNumber}`,
          html: paymentVerifiedTemplate({
            tenantName: `${fullPayment.tenant.firstName} ${fullPayment.tenant.lastName}`,
            invoiceNumber: fullPayment.invoice.invoiceNumber,
            amount: fullPayment.amount,
            status: status as 'PAID' | 'REJECTED',
          })
        });
      } catch (err) {
        console.error('Failed to send payment verification email:', err);
      }
    }
    
    return payment
  }, {
    body: t.Object({
      status: t.String(), // 'PAID' or 'REJECTED'
    }),
  })
  
  // Update payment (general update)
  .put('/:id', async ({ params, body }) => {
    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        slipUrl: body.slipUrl,
        amount: body.amount,
      },
      include: {
        invoice: true,
        tenant: true,
      },
    })
    
    return payment
  }, {
    body: t.Object({
      slipUrl: t.Optional(t.String()),
      amount: t.Optional(t.Number()),
    }),
  })
  
  // Delete payment
  .delete('/:id', async ({ params }) => {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    })
    
    if (!payment) {
      return { error: 'Payment not found' }
    }
    
    // Only allow deletion of pending payments
    if (payment.status === 'PAID') {
      return { error: 'Cannot delete verified payment' }
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.payment.delete({
        where: { id: params.id },
      })
      
      // Revert invoice status
      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'UNPAID' },
      })
    })
    
    return { success: true }
  })
