import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { UtilityType } from '@prisma/client'

export const meterRoutes = new Elysia({ prefix: '/api/meters' })
  // Get all meter readings
  .get('/', async ({ query }) => {
    const { month, roomId, utilityType } = query
    
    const where: any = {}
    if (month) where.month = month
    if (roomId) where.roomId = roomId
    if (utilityType) where.utilityType = utilityType as UtilityType
    
    const readings = await prisma.meterReading.findMany({
      where,
      include: {
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return readings
  }, {
    query: t.Object({
      month: t.Optional(t.String()),
      roomId: t.Optional(t.String()),
      utilityType: t.Optional(t.String()),
    }),
  })
  
  // Get readings for occupied rooms (for recording new readings)
  .get('/pending', async ({ query }) => {
    const { month } = query
    
    // Get occupied rooms with active leases
    const occupiedRooms = await prisma.room.findMany({
      where: { status: 'OCCUPIED' },
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          include: {
            tenant: true,
          },
          take: 1,
        },
        meterReadings: {
          where: month ? { month } : {},
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { floor: 'asc' },
        { number: 'asc' },
      ],
    })
    
    // Filter rooms that don't have both readings for current month
    const pendingRooms = occupiedRooms.filter(room => {
      if (!month) return true
      const hasElecReading = room.meterReadings.some(r => r.month === month && r.utilityType === 'ELECTRICITY')
      const hasWaterReading = room.meterReadings.some(r => r.month === month && r.utilityType === 'WATER')
      return !hasElecReading || !hasWaterReading
    })
    
    return pendingRooms.map(room => ({
      ...room,
      currentTenant: room.leases[0]?.tenant || null,
      lastElecReading: room.meterReadings.find(r => r.utilityType === 'ELECTRICITY'),
      lastWaterReading: room.meterReadings.find(r => r.utilityType === 'WATER'),
    }))
  }, {
    query: t.Object({
      month: t.Optional(t.String()),
    }),
  })
  
  // Record meter reading (handles both ELECTRICITY and WATER)
  .post('/', async ({ body }) => {
    const { roomId, month, utilityType, previousValue, currentValue, rateAtTime, isReset } = body
    
    // Validate: current must be >= previous (unless reset)
    if (!isReset && currentValue < previousValue) {
      return { error: 'Current reading must be greater than or equal to previous reading' }
    }
    
    const usage = currentValue - previousValue
    
    const reading = await prisma.meterReading.create({
      data: {
        roomId,
        month,
        utilityType: utilityType as UtilityType,
        previousValue,
        currentValue,
        usage,
        rateAtTime,
        isReset: isReset || false,
      },
      include: {
        room: true,
      },
    })
    
    return reading
  }, {
    body: t.Object({
      roomId: t.String(),
      month: t.String(),
      utilityType: t.String(), // 'ELECTRICITY' or 'WATER'
      previousValue: t.Number(),
      currentValue: t.Number(),
      rateAtTime: t.Number(),
      isReset: t.Optional(t.Boolean()),
    }),
  })
  
  // Bulk record both electricity and water readings
  .post('/bulk', async ({ body }) => {
    const { roomId, month, electricity, water } = body
    
    const readings = await prisma.$transaction(async (tx) => {
      const elecUsage = electricity.currentValue - electricity.previousValue
      const waterUsage = water.currentValue - water.previousValue
      
      const elecReading = await tx.meterReading.upsert({
        where: {
          roomId_month_utilityType: {
            roomId,
            month,
            utilityType: 'ELECTRICITY',
          },
        },
        update: {
          previousValue: electricity.previousValue,
          currentValue: electricity.currentValue,
          usage: elecUsage,
          rateAtTime: electricity.rateAtTime,
        },
        create: {
          roomId,
          month,
          utilityType: 'ELECTRICITY',
          previousValue: electricity.previousValue,
          currentValue: electricity.currentValue,
          usage: elecUsage,
          rateAtTime: electricity.rateAtTime,
        },
      })
      
      const waterReading = await tx.meterReading.upsert({
        where: {
          roomId_month_utilityType: {
            roomId,
            month,
            utilityType: 'WATER',
          },
        },
        update: {
          previousValue: water.previousValue,
          currentValue: water.currentValue,
          usage: waterUsage,
          rateAtTime: water.rateAtTime,
        },
        create: {
          roomId,
          month,
          utilityType: 'WATER',
          previousValue: water.previousValue,
          currentValue: water.currentValue,
          usage: waterUsage,
          rateAtTime: water.rateAtTime,
        },
      })
      
      return { electricity: elecReading, water: waterReading }
    })
    
    return readings
  }, {
    body: t.Object({
      roomId: t.String(),
      month: t.String(),
      electricity: t.Object({
        previousValue: t.Number(),
        currentValue: t.Number(),
        rateAtTime: t.Number(),
      }),
      water: t.Object({
        previousValue: t.Number(),
        currentValue: t.Number(),
        rateAtTime: t.Number(),
      }),
    }),
  })
  
  // Update meter reading
  .put('/:id', async ({ params, body }) => {
    const existing = await prisma.meterReading.findUnique({
      where: { id: params.id },
    })
    
    if (!existing) {
      return { error: 'Meter reading not found' }
    }
    
    const currentValue = body.currentValue ?? existing.currentValue
    const previousValue = body.previousValue ?? existing.previousValue
    const usage = currentValue - previousValue
    
    const reading = await prisma.meterReading.update({
      where: { id: params.id },
      data: {
        ...body,
        usage,
      },
    })
    
    return reading
  }, {
    body: t.Object({
      previousValue: t.Optional(t.Number()),
      currentValue: t.Optional(t.Number()),
      rateAtTime: t.Optional(t.Number()),
      isReset: t.Optional(t.Boolean()),
    }),
  })
