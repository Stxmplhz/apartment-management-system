import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Loader2, FileText, Wrench, CreditCard, Home, Calendar, ArrowRight } from 'lucide-react'
import type { Invoice, MaintenanceRequest } from '@/lib/types'
import { toast } from 'sonner'

const formatTHB = (amount: number) =>
  `THB ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(amount)}`

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PAID:           'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
    UNPAID:         'bg-amber-500/15 text-amber-500 border-amber-500/20',
    PENDING_VERIFY: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
    RESOLVED:       'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
    IN_PROGRESS:    'bg-blue-500/15 text-blue-500 border-blue-500/20',
    OPEN:           'bg-amber-500/15 text-amber-500 border-amber-500/20',
    CLOSED:         'bg-secondary text-muted-foreground border-border',
    ASSIGNED:       'bg-blue-500/15 text-blue-500 border-blue-500/20',
  }
  return map[status] ?? 'bg-secondary text-muted-foreground border-border'
}

export default function TenantDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [lease, setLease] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const tenantId = user?.profile?.id

  useEffect(() => { loadData() }, [tenantId])

  const loadData = async () => {
    if (!tenantId) { setLoading(false); return }
    try {
      setLoading(true)
      const [allLeases, allRequests] = await Promise.all([
        api.leases.list(),
        api.maintenance.list({ tenantId }),
      ])
      const myLease = allLeases.find((l: any) => l.tenantId === tenantId && l.status === 'ACTIVE')
        ?? allLeases.find((l: any) => l.tenantId === tenantId)
      setLease(myLease ?? null)
      setRequests(allRequests)
      if (myLease) {
        const inv = await api.invoices.list()
        setInvoices(inv.filter((i: any) => i.leaseId === myLease.id))
      }
    } catch { toast.error('Failed to load data') } finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>

  const stats = {
    pendingInvoices: invoices.filter(i => i.status === 'UNPAID' || i.status === 'PENDING_VERIFY').length,
    totalDue: invoices.filter(i => i.status === 'UNPAID' || i.status === 'PENDING_VERIFY').reduce((a, i) => a + i.totalAmount, 0),
    openRequests: requests.filter(r => r.status === 'OPEN' || r.status === 'ASSIGNED').length,
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
        <h1 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Welcome Back</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your apartment, payments, and maintenance requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Invoices', value: stats.pendingInvoices, icon: FileText, bg: 'bg-amber-500/15', iconColor: 'text-amber-500', bar: 'bg-amber-500' },
          { label: 'Amount Due', value: formatTHB(stats.totalDue), icon: CreditCard, bg: 'bg-red-500/15', iconColor: 'text-red-500', bar: 'bg-red-500' },
          { label: 'Open Requests', value: stats.openRequests, icon: Wrench, bg: 'bg-blue-500/15', iconColor: 'text-blue-500', bar: 'bg-blue-500' },
        ].map(({ label, value, icon: Icon, bg, iconColor, bar }) => (
          <div key={label} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className={cn('h-0.5', bar)} />
            <div className="p-5 flex items-center gap-4">
              <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                <Icon className={cn('h-4 w-4', iconColor)} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lease Info */}
      {lease && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>My Room</h2>
            <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-500 border-emerald-500/20">ACTIVE</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { icon: Home, label: 'Room', value: `Room ${lease.room?.number ?? '-'}` },
              { icon: CreditCard, label: 'Monthly Rent', value: formatTHB(lease.agreedBaseRent) },
              { icon: Calendar, label: 'Lease Expires', value: lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Indefinite' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="px-5 py-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Invoices</h2>
          <button onClick={() => navigate('/my-invoices')} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium">
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {invoices.length === 0 ? (
          <div className="text-center py-10 bg-secondary/50 border-2 border-dashed border-border rounded-xl">
            <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No invoices found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {[...invoices].sort((a, b) => {
              const order: Record<string, number> = { UNPAID: 0, PENDING_VERIFY: 1, PAID: 2 }
              return (order[a.status] ?? 3) - (order[b.status] ?? 3)
            }).slice(0, 3).map((invoice, i, arr) => (
              <div key={invoice.id} className={cn('flex items-center justify-between px-5 py-3.5', i < arr.length - 1 && 'border-b border-border')}>
                <div>
                  <p className="text-sm font-medium text-foreground">{invoice.month}</p>
                  <p className="text-[11px] text-muted-foreground">#{invoice.invoiceNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-foreground">{formatTHB(invoice.totalAmount)}</p>
                  <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', statusBadge(invoice.status))}>
                    {invoice.status === 'PAID' ? 'Paid' : invoice.status === 'PENDING_VERIFY' ? 'Verifying' : 'Unpaid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Maintenance Requests</h2>
          <button onClick={() => navigate('/my-maintenance')} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium">
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {requests.length === 0 ? (
          <div className="text-center py-10 bg-secondary/50 border-2 border-dashed border-border rounded-xl">
            <Wrench className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No maintenance requests</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {requests.slice(0, 3).map((req, i) => (
              <div key={req.id} className={cn('flex items-center justify-between px-5 py-3.5', i < Math.min(requests.length, 3) - 1 && 'border-b border-border')}>
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-foreground truncate">{req.description}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0', statusBadge(req.status))}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
