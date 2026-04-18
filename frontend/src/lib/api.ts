import type { User, Room, Tenant, MeterReading, Invoice, Payment, MaintenanceRequest, Technician, AuthResponse, ApiSuccess } from './types'

const API_BASE = import.meta.env.VITE_API_URL || ''

interface ValidationErrorDetail {
  path: string;
  message: string;
  value?: any;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options?.headers,
    },

    body: isFormData ? options.body : (options?.body ? JSON.stringify(options.body) : undefined),
  })  
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    
    if (errorData.details && Array.isArray(errorData.details)) {
      const msg = (errorData.details as ValidationErrorDetail[])
        .map((d) => `${d.path.substring(1)}: ${d.message}`)
        .join(', ')
      throw new Error(`Validation Error: ${msg}`)
    }
    
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

export const api = {
   // Auth
  auth: {
    login: (data: { email: string; password: string }) =>
      fetchApi<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () =>
      fetchApi<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
    getMe: () =>
      fetchApi('/api/auth/me'),
    registerTechnician: (data: any) => 
      fetchApi<ApiSuccess>('/api/auth/register-technician', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
  },
  
  // Users
  users: {
    list: () => fetchApi<User[]>('/api/users'),
    toggleStatus: (id: string, isActive: boolean) =>
      fetchApi<User>(`/api/users/${id}/status`, { 
        method: 'PUT', 
        body: JSON.stringify({ isActive }) 
      }),
    delete: (id: string) =>
      fetchApi<ApiSuccess>(`/api/users/${id}`, { method: 'DELETE' }),
  },

  // Rooms
  rooms: {
    list: (params?: { status?: string; floor?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.set('status', params.status)
      if (params?.floor) searchParams.set('floor', params.floor)
      const query = searchParams.toString()
      return fetchApi<Room[]>(`/api/rooms${query ? `?${query}` : ''}`)
    },
    get: (id: string) => fetchApi<Room>(`/api/rooms/${id}`),
    create: (data: Partial<Room>) => 
      fetchApi<Room>('/api/rooms', { method: 'POST', body: data as any }), 
    update: (id: string, data: Partial<Room>) => 
      fetchApi<Room>(`/api/rooms/${id}`, { method: 'PUT', body: data as any }),
    delete: (id: string) => 
      fetchApi<{ success: boolean }>(`/api/rooms/${id}`, { method: 'DELETE' }),
  },
  
  // Tenants
  tenants: {
    list: () => fetchApi<Tenant[]>('/api/tenants'),
    get: (id: string) => fetchApi<Tenant>(`/api/tenants/${id}`),
    create: (data: any) => 
      fetchApi<any>('/api/tenants/move-in', { method: 'POST', body: data }),
    update: (id: string, data: Partial<Tenant>) => 
      fetchApi<Tenant>(`/api/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    moveOut: (id: string) => 
      fetchApi<{ success: boolean }>(`/api/tenants/${id}`, { method: 'DELETE' }),
    resetPassword: (id: string) =>
      fetchApi<any>(`/api/tenants/${id}/reset-password`, { method: 'POST' }),
  },

  // Leases
  leases: {
    list: () => fetchApi<any[]>('/api/leases'),
    terminate: (id: string) => fetchApi<any>(`/api/leases/${id}/terminate`, { method: 'POST' }),
  },
  
  // Meter Readings
  meters: {
    list: (params?: { month?: string; roomId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.month) searchParams.set('month', params.month)
      if (params?.roomId) searchParams.set('roomId', params.roomId)
      const query = searchParams.toString()
      return fetchApi<MeterReading[]>(`/api/meters${query ? `?${query}` : ''}`)
    },
    pending: (month?: string) => {
      const query = month ? `?month=${month}` : ''
      return fetchApi<Room[]>(`/api/meters/pending${query}`)
    },
    create: (data: {
      roomId: string
      month: string
      electricityPrevious: number
      electricityCurrent: number
      waterPrevious: number
      waterCurrent: number
    }) => fetchApi<MeterReading>('/api/meters', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<MeterReading>) => 
      fetchApi<MeterReading>(`/api/meters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    bulkCreate: (data: { roomId: string, month: string, electricity: any, water: any }) => 
      fetchApi('/api/meters/bulk', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  // Invoices
  invoices: {
    list: (params?: { status?: string; month?: string; roomId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.set('status', params.status)
      if (params?.month) searchParams.set('month', params.month)
      if (params?.roomId) searchParams.set('roomId', params.roomId)
      const query = searchParams.toString()
      return fetchApi<Invoice[]>(`/api/invoices${query ? `?${query}` : ''}`)
    },
    get: (id: string) => fetchApi<Invoice>(`/api/invoices/${id}`),
    generate: (data: { roomId: string; month: string; monthDisplay?: string; dueDate?: string }) => 
      fetchApi<Invoice>('/api/invoices/generate', { method: 'POST', body: JSON.stringify(data) }),
    create: (data: Partial<Invoice>) => 
      fetchApi<Invoice>('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Invoice>) => 
      fetchApi<Invoice>(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  // Payments
  payments: {
    list: (params?: { status?: string; invoiceId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.set('status', params.status)
      if (params?.invoiceId) searchParams.set('invoiceId', params.invoiceId)
      const query = searchParams.toString()
      return fetchApi<Payment[]>(`/api/payments${query ? `?${query}` : ''}`)
    },
    get: (id: string) => fetchApi<Payment>(`/api/payments/${id}`),
    create: (data: { invoiceId: string; amount: number; slipUrl?: string }) => 
      fetchApi<Payment>('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
    verify: (id: string, status: string) => 
    fetchApi<Payment>(`/api/payments/${id}/verify`, { method: 'PUT', body: JSON.stringify({ status }) }),
    update: (id: string, data: { status?: string; slipUrl?: string; amount?: number }) => 
      fetchApi<Payment>(`/api/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => 
      fetchApi<{ success: boolean }>(`/api/payments/${id}`, { method: 'DELETE' }),
  },

  // Maintenance
  maintenance: {
    list: (params?: { status?: string; roomId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.set('status', params.status)
      if (params?.roomId) searchParams.set('roomId', params.roomId)
      const query = searchParams.toString()
      return fetchApi<MaintenanceRequest[]>(`/api/maintenance${query ? `?${query}` : ''}`)
    },
    get: (id: string) => fetchApi<MaintenanceRequest>(`/api/maintenance/${id}`),
    create: (data: { tenantId: string; description: string; imageUrl?: string }) =>
      fetchApi<MaintenanceRequest>('/api/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      fetchApi<MaintenanceRequest>(`/api/maintenance/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    assign: (id: string, technicianId: string) =>
      fetchApi<MaintenanceRequest>(`/api/maintenance/${id}/assign`, { method: 'PUT', body: JSON.stringify({ technicianId }) }),
    listTechnicians: () => 
      fetchApi<Technician[]>('/api/maintenance/technicians/list'),
  },
}
