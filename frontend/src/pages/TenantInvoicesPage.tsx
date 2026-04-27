import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { InvoiceCard } from "@/components/features/invoices/InvoiceCard"
import { InvoiceFilterBar } from "@/components/features/invoices/InvoiceFilterBar"
import { PaymentSlipUpload } from "@/components/features/invoices/PaymentSlipUpload"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Loader2, Receipt } from "lucide-react"
import { toast } from "sonner"
import type { Invoice } from "@/lib/types"

export default function TenantInvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)

  const tenantId = user?.profile?.id

  const loadInvoices = async () => {
    if (!tenantId) { setLoading(false); return }
    try {
      setLoading(true)
      const leases = await api.leases.list()
      const myLease = leases.find((l: any) => l.tenantId === tenantId && l.status === 'ACTIVE')
        ?? leases.find((l: any) => l.tenantId === tenantId)
      if (!myLease) { setInvoices([]); return }
      const data = await api.invoices.list({ month: selectedMonth })
      setInvoices(data.filter((inv: any) => inv.leaseId === myLease.id))
    } catch { toast.error('Failed to load invoices') } finally { setLoading(false) }
  }

  useEffect(() => { loadInvoices() }, [selectedMonth, tenantId])

  const processedInvoices = useMemo(() => {
    return invoices
      .filter(inv => {
        const matchSearch = inv.invoiceNumber?.includes(searchQuery) || inv.month?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchStatus = statusFilter === 'all' || inv.status === statusFilter
        return matchSearch && matchStatus
      })
      .sort((a, b) => sortBy === 'newest'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
  }, [invoices, searchQuery, statusFilter, sortBy])

  const filters = { searchQuery, setSearchQuery, statusFilter, setStatusFilter, floorFilter: 'all', setFloorFilter: () => {}, sortBy, setSortBy }
  const stats = { uniqueFloors: [] }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 h-6 w-6" /></div>

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>My Invoices</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your billing history and payment status</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 h-9 rounded-lg bg-secondary border-border text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 h-9">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm outline-none text-foreground" />
          </div>
        </div>
      </div>

      <InvoiceFilterBar filters={filters} uniqueFloors={stats.uniqueFloors} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {processedInvoices.map(invoice => (
          <InvoiceCard key={invoice.id} invoice={invoice} userRole={user?.role} isProcessing={processingId === invoice.id} onMarkPaid={() => {}} onOpenPay={() => { setSelectedInvoice(invoice); setSlipDialogOpen(true) }} />
        ))}
      </div>

      {processedInvoices.length === 0 && (
        <div className="text-center py-20 bg-secondary/50 border-2 border-dashed border-border rounded-2xl">
          <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No invoices found</p>
        </div>
      )}

      {selectedInvoice && <PaymentSlipUpload invoice={selectedInvoice} open={slipDialogOpen} onOpenChange={setSlipDialogOpen} onSuccess={loadInvoices} />}
    </div>
  )
}
