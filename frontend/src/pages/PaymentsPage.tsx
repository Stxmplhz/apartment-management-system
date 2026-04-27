import { usePayments } from "@/hooks/usePayments"
import { PaymentFilterBar } from "@/components/features/payments/PaymentFilterBar"
import { PaymentCard } from "@/components/features/payments/PaymentCard"
import { Loader2, Wallet } from "lucide-react"

export default function PaymentsPage() {
  const { processedPayments, loading, stats, uniqueFloors, dragActive, processingId, filters, actions } = usePayments()

  if (loading && processedPayments.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 h-6 w-6" /></div>
  }

  return (
    <div className="space-y-5 pb-20">
      <PaymentFilterBar stats={stats} filters={filters} uniqueFloors={uniqueFloors} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {processedPayments.map(payment => (
          <PaymentCard key={payment.id} payment={payment} dragActive={dragActive} processingId={processingId} actions={actions} />
        ))}
      </div>

      {processedPayments.length === 0 && (
        <div className="text-center py-20 bg-secondary/50 border-2 border-dashed border-border rounded-2xl">
          <Wallet className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No payment records found</p>
        </div>
      )}
    </div>
  )
}
