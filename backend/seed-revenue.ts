import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const lease = await prisma.lease.findFirst();
  if (!lease) {
    console.log("No lease found! Cannot seed invoices.");
    // Try to find a room and a tenant to create a dummy lease
    return;
  }

  console.log(`Seeding for lease: ${lease.id}`);

  // We need the last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthStr = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    // Check if invoice exists for this month and lease
    const existing = await prisma.invoice.findFirst({
      where: { leaseId: lease.id, month: monthStr }
    });

    const amount = Math.floor(Math.random() * 5000) + 5000; // 5000-10000

    if (!existing) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: `MOCK-${Date.now()}-${i}`,
          leaseId: lease.id,
          month: monthStr,
          baseRent: 4000,
          electricityCost: amount - 4500,
          waterCost: 500,
          totalAmount: amount,
          status: 'PAID'
        }
      });
      console.log(`Created mock invoice for ${monthStr} with amount ${amount}`);
    } else {
      await prisma.invoice.update({
        where: { id: existing.id },
        data: {
          status: 'PAID',
          totalAmount: amount
        }
      });
      console.log(`Updated existing invoice for ${monthStr} to PAID with amount ${amount}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
