import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceCard } from "@/components/features/invoices/InvoiceCard";
import { InvoiceFilterBar } from "@/components/features/invoices/InvoiceFilterBar";
import { PaymentSlipUpload } from "@/components/features/invoices/PaymentSlipUpload";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Loader2, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const { processedInvoices, loading, stats, filters, actions, processingId } = useInvoices(selectedMonth);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [slipDialogOpen, setSlipDialogOpen] = useState(false);

  if (loading && processedInvoices.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      {/* Header & Main Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black">Billing & Invoices</h1>
          <p className="text-sm text-slate-400">
            Unpaid: <span className="text-red-500 font-bold">{stats.pending} rooms</span> • 
            Total Due: <span className="text-slate-700 font-bold">{formatCurrency(stats.totalAmount)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-10 h-12 rounded-2xl bg-slate-50 border-none font-medium"
              value={filters.searchQuery}
              onChange={(e) => filters.setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bg-slate-50 rounded-2xl flex items-center px-3 h-12">
            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              className="bg-transparent font-bold text-sm outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <InvoiceFilterBar filters={filters} uniqueFloors={stats.uniqueFloors} />

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedInvoices.map(invoice => (
          <InvoiceCard 
            key={invoice.id} 
            invoice={invoice} 
            userRole={user?.role}
            isProcessing={processingId === invoice.id}
            onMarkPaid={actions.handleMarkPaid}
            onOpenPay={() => { setSelectedInvoice(invoice); setSlipDialogOpen(true); }}
          />
        ))}
      </div>

      {/* Empty State */}
      {processedInvoices.length === 0 && (
        <div className="text-center py-32 bg-slate-50 border-2 border-dashed rounded-[3rem]">
          <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="font-black text-slate-300 uppercase text-sm">No bills match your filters</p>
        </div>
      )}

      {/* Modal Section */}
      {selectedInvoice && (
        <PaymentSlipUpload 
          invoice={selectedInvoice} 
          open={slipDialogOpen} 
          onOpenChange={setSlipDialogOpen} 
          onSuccess={actions.refresh} 
        />
      )}
    </div>
  );
}