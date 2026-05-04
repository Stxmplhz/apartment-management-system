import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useInvoices } from "@/hooks/useInvoices"
import { InvoiceCard } from "@/components/features/invoices/InvoiceCard"
import { InvoiceFilterBar } from "@/components/features/invoices/InvoiceFilterBar"
import { PaymentSlipUpload } from "@/components/features/invoices/PaymentSlipUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Loader2, Receipt, RefreshCw } from "lucide-react"
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
    <div className="space-y-6 pb-20">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex-1">
          <h1 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Billing & Invoices</h1>
          <div className="flex items-center gap-3 mt-1">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
               <div className="h-1.5 w-1.5 rounded-full bg-red-500" /> {stats.pending} Unpaid
             </div>
             <div className="h-1 w-1 rounded-full bg-border" />
             <div className="text-xs font-medium text-foreground">{formatCurrency(stats.totalAmount)} Outstanding</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Room # or Tenant name..." 
              className="pl-9 h-10 rounded-xl bg-secondary border-border text-sm focus:ring-2 focus:ring-blue-500/20" 
              value={filters.searchQuery} 
              onChange={(e) => filters.setSearchQuery(e.target.value)} 
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={actions.handleSyncOverdue} 
              disabled={loading}
              className="h-10 rounded-xl border-border hover:bg-secondary flex items-center gap-2 text-xs font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Status</span>
            </Button>

            <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 h-10 flex-1 sm:flex-none">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
                className="bg-transparent text-sm outline-none text-foreground font-medium" 
              />
            </div>
          </div>
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
