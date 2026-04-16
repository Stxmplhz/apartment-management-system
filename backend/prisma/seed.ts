import { PrismaClient, Role, RoomStatus, LeaseStatus, UtilityType, InvoiceStatus, PaymentStatus, MaintenanceStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.maintenanceRequest.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.meterReading.deleteMany()
  await prisma.lease.deleteMany()
  await prisma.technician.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()

  // --- Create Admin User ---
  const adminPassword = await hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@apartment.com',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      adminProfile: {
        create: {
          staffId: 'STAFF-001'
        }
      }
    }
  })
  console.log('Created admin user:', adminUser.email)

  // --- Create Technician User ---
  const techPassword = await hash('tech123', 10)
  const techUser = await prisma.user.create({
    data: {
      email: 'technician@apartment.com',
      password: techPassword,
      role: Role.TECHNICIAN,
      isActive: true,
      techProfile: {
        create: {
          expertise: 'Plumbing, Electrical'
        }
      }
    },
    include: { techProfile: true }
  })
  console.log('Created technician user:', techUser.email)

  // --- Create Rooms ---
  const rooms = await Promise.all([
    prisma.room.create({ data: { number: '101', floor: 1, status: RoomStatus.VACANT, pricePerMonth: 5000 } }),
    prisma.room.create({ data: { number: '102', floor: 1, status: RoomStatus.VACANT, pricePerMonth: 5000 } }),
    prisma.room.create({ data: { number: '103', floor: 1, status: RoomStatus.MAINTENANCE, pricePerMonth: 5500 } }),
    prisma.room.create({ data: { number: '201', floor: 2, status: RoomStatus.VACANT, pricePerMonth: 5500 } }),
    prisma.room.create({ data: { number: '202', floor: 2, status: RoomStatus.VACANT, pricePerMonth: 5500 } }),
    prisma.room.create({ data: { number: '203', floor: 2, status: RoomStatus.VACANT, pricePerMonth: 6000 } }),
    prisma.room.create({ data: { number: '301', floor: 3, status: RoomStatus.VACANT, pricePerMonth: 6000 } }),
    prisma.room.create({ data: { number: '302', floor: 3, status: RoomStatus.VACANT, pricePerMonth: 6000 } }),
  ])
  console.log(`Created ${rooms.length} rooms`)

  // --- Create Tenant Users with Leases ---
  const tenantPassword = await hash('tenant123', 10)
  
  // Tenant 1 - Active lease (Room 101)
  const tenant1User = await prisma.user.create({
    data: {
      email: 'somchai@email.com',
      password: tenantPassword,
      role: Role.TENANT,
      isActive: true,
      tenantProfile: {
        create: {
          firstName: 'Somchai',
          lastName: 'Jaidee',
          phone: '081-234-5678',
          nationalId: '1234567890123',
        }
      }
    },
    include: { tenantProfile: true }
  })

  const lease1 = await prisma.lease.create({
    data: {
      roomId: rooms[0].id,
      tenantId: tenant1User.tenantProfile!.id,
      startDate: new Date('2024-01-15'),
      agreedBaseRent: 5000,
      status: LeaseStatus.ACTIVE,
    }
  })

  await prisma.room.update({
    where: { id: rooms[0].id },
    data: { status: RoomStatus.OCCUPIED }
  })

  // Tenant 2 - Active lease (Room 102)
  const tenant2User = await prisma.user.create({
    data: {
      email: 'somsri@email.com',
      password: tenantPassword,
      role: Role.TENANT,
      isActive: true,
      tenantProfile: {
        create: {
          firstName: 'Somsri',
          lastName: 'Rakdee',
          phone: '089-876-5432',
          nationalId: '9876543210987',
        }
      }
    },
    include: { tenantProfile: true }
  })

  const lease2 = await prisma.lease.create({
    data: {
      roomId: rooms[1].id,
      tenantId: tenant2User.tenantProfile!.id,
      startDate: new Date('2024-02-01'),
      agreedBaseRent: 5000,
      status: LeaseStatus.ACTIVE,
    }
  })

  await prisma.room.update({
    where: { id: rooms[1].id },
    data: { status: RoomStatus.OCCUPIED }
  })

  // Tenant 3 - Active lease (Room 201)
  const tenant3User = await prisma.user.create({
    data: {
      email: 'somying@email.com',
      password: tenantPassword,
      role: Role.TENANT,
      isActive: true,
      tenantProfile: {
        create: {
          firstName: 'Somying',
          lastName: 'Sukjai',
          phone: '062-111-2222',
          nationalId: '1111222233334',
        }
      }
    },
    include: { tenantProfile: true }
  })

  const lease3 = await prisma.lease.create({
    data: {
      roomId: rooms[3].id,
      tenantId: tenant3User.tenantProfile!.id,
      startDate: new Date('2024-03-01'),
      agreedBaseRent: 5500,
      status: LeaseStatus.ACTIVE,
    }
  })

  await prisma.room.update({
    where: { id: rooms[3].id },
    data: { status: RoomStatus.OCCUPIED }
  })

  console.log('Created 3 tenants with active leases')

  // --- Create Meter Readings (separate by utility type) ---
  const currentMonth = '2024-03'

  // Room 101 meter readings
  await prisma.meterReading.createMany({
    data: [
      { roomId: rooms[0].id, month: currentMonth, utilityType: UtilityType.ELECTRICITY, previousValue: 1150, currentValue: 1280, usage: 130, rateAtTime: 8 },
      { roomId: rooms[0].id, month: currentMonth, utilityType: UtilityType.WATER, previousValue: 115, currentValue: 127, usage: 12, rateAtTime: 20 },
    ]
  })

  // Room 102 meter readings
  await prisma.meterReading.createMany({
    data: [
      { roomId: rooms[1].id, month: currentMonth, utilityType: UtilityType.ELECTRICITY, previousValue: 2000, currentValue: 2180, usage: 180, rateAtTime: 8 },
      { roomId: rooms[1].id, month: currentMonth, utilityType: UtilityType.WATER, previousValue: 200, currentValue: 220, usage: 20, rateAtTime: 20 },
    ]
  })

  // Room 201 meter readings
  await prisma.meterReading.createMany({
    data: [
      { roomId: rooms[3].id, month: currentMonth, utilityType: UtilityType.ELECTRICITY, previousValue: 500, currentValue: 620, usage: 120, rateAtTime: 8 },
      { roomId: rooms[3].id, month: currentMonth, utilityType: UtilityType.WATER, previousValue: 50, currentValue: 65, usage: 15, rateAtTime: 20 },
    ]
  })

  console.log('Created meter readings')

  // --- Create Invoices (linked to Lease) ---
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-03-101',
      leaseId: lease1.id,
      month: 'March 2024',
      baseRent: 5000,
      electricityCost: 1040, // 130 * 8
      waterCost: 240, // 12 * 20
      totalAmount: 6280,
      status: InvoiceStatus.UNPAID,
      dueDate: new Date('2024-03-05'),
    }
  })

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-03-102',
      leaseId: lease2.id,
      month: 'March 2024',
      baseRent: 5000,
      electricityCost: 1440, // 180 * 8
      waterCost: 400, // 20 * 20
      totalAmount: 6840,
      status: InvoiceStatus.PENDING_VERIFY,
      dueDate: new Date('2024-03-05'),
    }
  })

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-03-201',
      leaseId: lease3.id,
      month: 'March 2024',
      baseRent: 5500,
      electricityCost: 960, // 120 * 8
      waterCost: 300, // 15 * 20
      totalAmount: 6760,
      status: InvoiceStatus.PAID,
      dueDate: new Date('2024-03-05'),
    }
  })

  console.log('Created 3 invoices')

  // --- Create Payments ---
  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      tenantId: tenant2User.tenantProfile!.id,
      amount: 6840,
      slipUrl: 'https://www.kasikornbank.com/SiteCollectionDocuments/personal/digital-banking/kplus/v2/img/en/instruction/transfer-paynowid-13.png',
      status: PaymentStatus.PENDING,
    }
  })

  await prisma.payment.create({
    data: {
      invoiceId: invoice3.id,
      tenantId: tenant3User.tenantProfile!.id,
      amount: 6760,
      slipUrl: 'https://pattaya-pages.com/wp-content/uploads/2022/05/Screenshot_20220527-150835.jpg',
      status: PaymentStatus.PAID,
      verifiedAt: new Date('2024-03-03'),
    }
  })

  console.log('Created payments')

  // --- Create Maintenance Requests ---
  await prisma.maintenanceRequest.create({
    data: {
      roomId: rooms[0].id,
      tenantId: tenant1User.tenantProfile!.id,
      description: 'Air conditioner not cooling properly',
      imageUrl: 'https://lirp.cdn-website.com/eb0d1dad/dms3rep/multi/opt/Split+system+Air+Conditioner-640w.jpg',
      status: MaintenanceStatus.OPEN,
    }
  })

  await prisma.maintenanceRequest.create({
    data: {
      roomId: rooms[1].id,
      tenantId: tenant2User.tenantProfile!.id,
      description: 'Water leak from bathroom ceiling',
      imageUrl: 'https://ranshaw.com/uploads/_900xAUTO_crop_center-center/Ranshaw-Ceiling-Water-Leak.jpg',
      status: MaintenanceStatus.IN_PROGRESS,
      technicianId: techUser.techProfile!.id,
      adminNotes: 'Assigned to technician for inspection',
    }
  })

  console.log('Created maintenance requests')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
