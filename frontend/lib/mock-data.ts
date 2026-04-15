import type { Room, Invoice, Payment, MeterReading } from './types'

export const rooms: Room[] = [
  { id: '1', number: '101', floor: 1, status: 'occupied', pricePerMonth: 8500, tenant: { id: 't1', name: 'Somchai Prasert', phone: '081-234-5678', nationalId: '1234567890123', moveInDate: '2024-01-15' } },
  { id: '2', number: '102', floor: 1, status: 'available', pricePerMonth: 8500 },
  { id: '3', number: '103', floor: 1, status: 'maintenance', pricePerMonth: 8000 },
  { id: '4', number: '104', floor: 1, status: 'occupied', pricePerMonth: 9000, tenant: { id: 't2', name: 'Natthaphon Wong', phone: '089-876-5432', nationalId: '9876543210987', moveInDate: '2024-03-01' } },
  { id: '5', number: '201', floor: 2, status: 'available', pricePerMonth: 9500 },
  { id: '6', number: '202', floor: 2, status: 'occupied', pricePerMonth: 9500, tenant: { id: 't3', name: 'Siriporn Chaiyasit', phone: '062-345-6789', nationalId: '5678901234567', moveInDate: '2023-11-01' } },
  { id: '7', number: '203', floor: 2, status: 'available', pricePerMonth: 9000 },
  { id: '8', number: '204', floor: 2, status: 'occupied', pricePerMonth: 10000, tenant: { id: 't4', name: 'Thanakorn Pimpa', phone: '095-111-2233', nationalId: '1122334455667', moveInDate: '2024-02-15' } },
  { id: '9', number: '301', floor: 3, status: 'occupied', pricePerMonth: 11000, tenant: { id: 't5', name: 'Kanya Rattana', phone: '086-999-8888', nationalId: '9988776655443', moveInDate: '2023-08-01' } },
  { id: '10', number: '302', floor: 3, status: 'maintenance', pricePerMonth: 11000 },
  { id: '11', number: '303', floor: 3, status: 'available', pricePerMonth: 10500 },
  { id: '12', number: '304', floor: 3, status: 'occupied', pricePerMonth: 12000, tenant: { id: 't6', name: 'Pitipat Suksan', phone: '082-444-5566', nationalId: '4455667788990', moveInDate: '2024-04-01' } },
]

export const meterReadings: MeterReading[] = [
  { roomId: '1', month: '2024-03', electricity: { previous: 1245, current: 0, usage: 0, rate: 4.5, cost: 0 }, water: { previous: 58, current: 0, usage: 0, rate: 18, cost: 0 } },
  { roomId: '4', month: '2024-03', electricity: { previous: 892, current: 0, usage: 0, rate: 4.5, cost: 0 }, water: { previous: 42, current: 0, usage: 0, rate: 18, cost: 0 } },
  { roomId: '6', month: '2024-03', electricity: { previous: 1567, current: 0, usage: 0, rate: 4.5, cost: 0 }, water: { previous: 73, current: 0, usage: 0, rate: 18, cost: 0 } },
  { roomId: '8', month: '2024-03', electricity: { previous: 1034, current: 0, usage: 0, rate: 4.5, cost: 0 }, water: { previous: 51, current: 0, usage: 0, rate: 18, cost: 0 } },
  { roomId: '9', month: '2024-03', electricity: { previous: 1389, current: 0, usage: 0, rate: 4.5, cost: 0 }, water: { previous: 65, current: 0, usage: 0, rate: 18, cost: 0 } },
  { roomId: '12', month: '2024-03', electricity: { previous: 756, current: 0, usage: 0, rate: 4.5, cost: 0 }, water: { previous: 38, current: 0, usage: 0, rate: 18, cost: 0 } },
]

export const invoices: Invoice[] = [
  { id: 'inv1', roomId: '1', roomNumber: '101', tenantName: 'Somchai Prasert', month: 'March 2024', baseRent: 8500, electricity: { usage: 145, cost: 652.5 }, water: { usage: 12, cost: 216 }, totalAmount: 9368.5, status: 'pending' },
  { id: 'inv2', roomId: '4', roomNumber: '104', tenantName: 'Natthaphon Wong', month: 'March 2024', baseRent: 9000, electricity: { usage: 98, cost: 441 }, water: { usage: 8, cost: 144 }, totalAmount: 9585, status: 'paid' },
  { id: 'inv3', roomId: '6', roomNumber: '202', tenantName: 'Siriporn Chaiyasit', month: 'March 2024', baseRent: 9500, electricity: { usage: 210, cost: 945 }, water: { usage: 15, cost: 270 }, totalAmount: 10715, status: 'pending' },
  { id: 'inv4', roomId: '8', roomNumber: '204', tenantName: 'Thanakorn Pimpa', month: 'March 2024', baseRent: 10000, electricity: { usage: 175, cost: 787.5 }, water: { usage: 11, cost: 198 }, totalAmount: 10985.5, status: 'pending' },
  { id: 'inv5', roomId: '9', roomNumber: '301', tenantName: 'Kanya Rattana', month: 'March 2024', baseRent: 11000, electricity: { usage: 132, cost: 594 }, water: { usage: 9, cost: 162 }, totalAmount: 11756, status: 'paid' },
]

export const payments: Payment[] = [
  { id: 'pay1', invoiceId: 'inv1', roomNumber: '101', tenantName: 'Somchai Prasert', amount: 9368.5, status: 'pending', submittedAt: '2024-04-02' },
  { id: 'pay2', invoiceId: 'inv3', roomNumber: '202', tenantName: 'Siriporn Chaiyasit', amount: 10715, slipUrl: '/placeholder.svg', status: 'pending', submittedAt: '2024-04-03' },
  { id: 'pay3', invoiceId: 'inv4', roomNumber: '204', tenantName: 'Thanakorn Pimpa', amount: 10985.5, slipUrl: '/placeholder.svg', status: 'pending', submittedAt: '2024-04-01' },
  { id: 'pay4', invoiceId: 'inv2', roomNumber: '104', tenantName: 'Natthaphon Wong', amount: 9585, slipUrl: '/placeholder.svg', status: 'paid', submittedAt: '2024-03-28' },
  { id: 'pay5', invoiceId: 'inv5', roomNumber: '301', tenantName: 'Kanya Rattana', amount: 11756, slipUrl: '/placeholder.svg', status: 'paid', submittedAt: '2024-03-30' },
]
