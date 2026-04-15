import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'
import { Loader2, FileText, Wrench, AlertCircle } from 'lucide-react'
import type { Invoice, Payment, MaintenanceRequest } from '@/lib/types'
import { toast } from 'sonner'

export default function TenantDashboard() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load invoices for current tenant
      const invoicesData = await api.invoices.list()
      setInvoices(invoicesData)

      // Load payments
      const paymentsData = await api.payments.list()
      setPayments(paymentsData)

      // Load maintenance requests
      const requestsData = await api.maintenance.list()
      setRequests(requestsData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const stats = {
    pendingInvoices: invoices.filter(i => i.status === 'UNPAID' || i.status === 'PENDING_VERIFY').length,
    totalDue: invoices
      .filter(i => i.status === 'UNPAID' || i.status === 'PENDING_VERIFY')
      .reduce((acc, i) => acc + i.totalAmount, 0),
    openRequests: requests.filter(r => r.status === 'OPEN' || r.status === 'ASSIGNED').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground mt-1">Manage your apartment, payments, and maintenance requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invoices</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingInvoices}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalDue)}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Requests</p>
                <p className="text-3xl font-bold mt-2">{stats.openRequests}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Invoices</h2>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/invoices'}>
            View All
          </Button>
        </div>
        {invoices.length === 0 ? (
          <Card className="border-border">
            <CardContent className="pt-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No invoices found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {invoices.slice(0, 3).map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{invoice.month}</p>
                  <p className="text-sm text-muted-foreground">Invoice #{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold">{formatCurrency(invoice.totalAmount)}</p>
                  <span className={cn(
                    "inline-flex text-xs font-medium px-2 py-1 rounded-full",
                    invoice.status === 'PAID'
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-amber-500/15 text-amber-500"
                  )}>
                    {invoice.status === 'PAID' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Maintenance Requests</h2>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/maintenance'}>
            View All
          </Button>
        </div>
        {requests.length === 0 ? (
          <Card className="border-border">
            <CardContent className="pt-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No maintenance requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 3).map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{request.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={cn(
                  "inline-flex text-xs font-medium px-2 py-1 rounded-full ml-4",
                  request.status === 'RESOLVED'
                    ? "bg-emerald-500/15 text-emerald-500"
                    : request.status === 'IN_PROGRESS'
                    ? "bg-blue-500/15 text-blue-500"
                    : "bg-amber-500/15 text-amber-500"
                )}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          className="h-12 text-base"
          onClick={() => window.location.href = '/invoices'}
        >
          <FileText className="h-5 w-5 mr-2" />
          View All Invoices
        </Button>
        <Button
          className="h-12 text-base"
          onClick={() => window.location.href = '/maintenance'}
        >
          <Wrench className="h-5 w-5 mr-2" />
          Create Maintenance Request
        </Button>
      </div>
    </div>
  )
}
