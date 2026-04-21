// --- Enums ---
export type Role = 'ADMIN' | 'TENANT' | 'TECHNICIAN' | 'OWNER'
export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE'
export type LeaseStatus = 'ACTIVE' | 'TERMINATED' | 'COMPLETED'
export type UtilityType = 'WATER' | 'ELECTRICITY'
export type InvoiceStatus = 'UNPAID' | 'PENDING_VERIFY' | 'PAID' | 'OVERDUE'
export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED'
export type MaintenanceStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED'

// --- User & Authentication ---
export interface User {
  id: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Admin {
  id: string
  userId: string
  user?: User
  staffId: string
}

export interface Technician {
  id: string
  userId: string
  user?: User
  firstName: string  
  lastName: string 
  phone: string     
  expertise?: string
  assignedJobs?: MaintenanceRequest[]
  activeJobsCount?: number
}

// --- Space Management ---
export interface Room {
  id: string
  number: string
  floor: number
  status: RoomStatus
  pricePerMonth: number
  tenant?: { name: string } | null
  meterReadings?: MeterReading[]
  maintenanceJobs?: MaintenanceRequest[]
  leases?: Lease[]
  currentLease?: Lease | null
  currentTenant?: Tenant | null
  createdAt: string
  updatedAt: string
}

// --- Lease & Tenant ---
export interface Lease {
  id: string
  roomId: string
  room?: Room
  tenantId: string
  tenant: Tenant
  startDate: string
  endDate?: string | null
  contractUrl?: string | null
  agreedBaseRent: number
  status: LeaseStatus
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  userId: string
  user?: User
  firstName: string
  lastName: string
  name?: string
  phone: string
  nationalId: string
  currentRoom?: Room | null
  payments?: Payment[]
  requests?: MaintenanceRequest[]
  createdAt: string
  updatedAt: string
}

// --- Utility & Billing ---
export interface MeterReading {
  id: string
  roomId: string
  month: string
  utilityType: UtilityType
  previousValue: number
  usage: number
  rateAtTime: number
  isReset: boolean
  electricityPrevious?: number 
  electricityCurrent?: number
  waterPrevious?: number
  waterCurrent?: number
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  leaseId: string
  lease?: Lease
  month: string
  baseRent: number
  electricityCost: number
  electricityUsage: number 
  waterCost: number
  waterUsage: number     
  totalAmount: number
  status: InvoiceStatus
  tenantName: string     
  room?: { number: string } | null
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  invoice?: Invoice
  tenantId: string
  tenant?: Tenant
  amount: number
  slipUrl?: string | null
  status: PaymentStatus
  createdAt: string
  updatedAt: string
}

// --- Maintenance System ---
export interface MaintenanceRequest {
  id: string
  roomId: string
  room?: Room
  tenantId: string
  tenant?: Tenant
  description: string
  imageUrl?: string | null
  status: MaintenanceStatus
  technicianId?: string | null
  technician?: Technician | null
  adminNotes?: string | null
  createdAt: string
  updatedAt: string
}

// --- Auth Response ---
export interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    role: Role
    isActive: boolean
    profile: Admin | Tenant | Technician | null
  }
  error?: string
}

// --- Move-in Request ---
export interface MoveInRequest {
  email: string
  firstName: string
  lastName: string
  phone: string
  nationalId: string
  roomId: string
  startDate: string
  agreedBaseRent?: number
  initialElectricity?: number
  initialWater?: number
}

// --- API Response Types ---
export interface ApiError {
  error: string
}

export interface ApiSuccess {
  success: boolean
  message?: string
}
