import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useInvoices } from "@/hooks/useInvoices"
import { InvoiceCard } from "@/components/features/invoices/InvoiceCard"
import { InvoiceFilterBar } from "@/components/features/invoices/InvoiceFilterBar"
import { PaymentSlipUpload } from "@/components/features/invoices/PaymentSlipUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Loader2, Receipt } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Invoice } from "@/lib/types"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const { processedInvoices, loading, stats, filters, actions, processingId } = useInvoices(selectedMonth)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)

  if (loading && processedInvoices.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 h-6 w-6" /></div>
  }

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Billing & Invoices</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unpaid: <span className="text-red-500 font-semibold">{stats.pending} rooms</span>
            {' · '}Total Due: <span className="text-foreground font-semibold">{formatCurrency(stats.totalAmount)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 h-9 rounded-lg bg-secondary border-border text-sm" value={filters.searchQuery} onChange={(e) => filters.setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 h-9">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm outline-none text-foreground" />
          </div>
          {user?.role === 'ADMIN' && (
            <Button 
              size="sm" 
              onClick={actions.handleGenerateAll} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9 px-4"
            >
              <Receipt className="mr-1.5 h-3.5 w-3.5" /> Generate All
            </Button>
          )}
        </div>
      </div>

      <InvoiceFilterBar filters={filters} uniqueFloors={stats.uniqueFloors} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {processedInvoices.map(invoice => (
          <InvoiceCard key={invoice.id} invoice={invoice} userRole={user?.role} isProcessing={processingId === invoice.id} onMarkPaid={actions.handleMarkPaid} onOpenPay={() => { setSelectedInvoice(invoice); setSlipDialogOpen(true) }} />
        ))}
      </div>

      {processedInvoices.length === 0 && (
        <div className="text-center py-20 bg-secondary/50 border-2 border-dashed border-border rounded-2xl">
          <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No bills match your filters</p>
        </div>
      )}

      {selectedInvoice && <PaymentSlipUpload invoice={selectedInvoice} open={slipDialogOpen} onOpenChange={setSlipDialogOpen} onSuccess={actions.refresh} />}
    </div>
  )
}
