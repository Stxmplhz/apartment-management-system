import { usePayments } from "@/hooks/usePayments"
import { PaymentFilterBar } from "@/components/features/payments/PaymentFilterBar"
import { PaymentCard } from "@/components/features/payments/PaymentCard"
import { Loader2, Wallet } from "lucide-react"

export default function PaymentsPage() {
  const { 
    processedPayments, loading, stats, uniqueFloors, 
    dragActive, processingId, filters, actions 
  } = usePayments()

  if (loading && processedPayments.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
  }

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      
      <PaymentFilterBar 
        stats={stats} 
        filters={filters} 
        uniqueFloors={uniqueFloors} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedPayments.map(payment => (
          <PaymentCard 
            key={payment.id} 
            payment={payment}
            dragActive={dragActive}
            processingId={processingId}
            actions={actions}
          />
        ))}
      </div>

      {/* Empty State */}
      {processedPayments.length === 0 && (
        <div className="text-center py-32 bg-slate-50 border-2 border-dashed rounded-[3rem]">
          <Wallet className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="font-black text-slate-300 uppercase tracking-widest text-sm">No payment records found</p>
        </div>
      )}
    </div>
  )
}