export type RoomStatus = 'available' | 'occupied' | 'maintenance'

export interface Room {
  id: string
  number: string
  floor: number
  status: RoomStatus
  pricePerMonth: number
  tenant?: Tenant
}

export interface Tenant {
  id: string
  name: string
  phone: string
  nationalId: string
  moveInDate: string
}

export interface MeterReading {
  roomId: string
  month: string
  electricity: {
    previous: number
    current: number
    usage: number
    rate: number
    cost: number
  }
  water: {
    previous: number
    current: number
    usage: number
    rate: number
    cost: number
  }
}

export interface Invoice {
  id: string
  roomId: string
  roomNumber: string
  tenantName: string
  month: string
  baseRent: number
  electricity: {
    usage: number
    cost: number
  }
  water: {
    usage: number
    cost: number
  }
  totalAmount: number
  status: 'pending' | 'paid'
}

export type PaymentStatus = 'pending' | 'paid' | 'rejected'

export interface Payment {
  id: string
  invoiceId: string
  roomNumber: string
  tenantName: string
  amount: number
  slipUrl?: string
  status: PaymentStatus
  submittedAt: string
}
