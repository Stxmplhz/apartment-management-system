import { useState, useCallback, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency, formatShortDate } from "@/lib/utils"
import { Upload, Check, X, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { Payment, PaymentStatus } from "@/lib/types"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all')
  const [dragActive, setDragActive] = useState<string | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const data = await api.payments.list()
      setPayments(data)
    } catch (error) {
      console.error('Failed to load payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter)

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    paid: payments.filter(p => p.status === 'PAID').length,
    rejected: payments.filter(p => p.status === 'REJECTED').length,
  }

  const handleDrag = useCallback((e: React.DragEvent, paymentId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(paymentId)
    } else if (e.type === "dragleave") {
      setDragActive(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, paymentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const url = URL.createObjectURL(file)
      setPayments(prev => 
        prev.map(p => p.id === paymentId ? { ...p, slipUrl: url } : p)
      )
    }
  }, [])

  const handleFileUpload = (paymentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setPayments(prev => 
        prev.map(p => p.id === paymentId ? { ...p, slipUrl: url } : p)
      )
    }
  }

  const handleStatusChange = async (paymentId: string, status: PaymentStatus) => {
  try {
    await api.payments.verify(paymentId, status) 
    
    setPayments(prev => 
      prev.map(p => p.id === paymentId ? { ...p, status } : p)
    )
    toast.success(status === 'PAID' ? 'Payment approved' : 'Payment rejected')
  } catch (error) {
    console.error('Failed to update payment:', error)
    toast.error('Failed to update payment status')
  }
}

  const statusConfig = {
    PENDING: { label: "Pending", icon: Clock, bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30" },
    PAID: { label: "Approved", icon: CheckCircle, bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30" },
    REJECTED: { label: "Rejected", icon: XCircle, bg: "bg-red-500/15", text: "text-red-500", border: "border-red-500/30" },
  }

  const filters: { value: PaymentStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'PENDING', label: 'Pending', count: stats.pending },
    { value: 'PAID', label: 'Approved', count: stats.paid },
    { value: 'REJECTED', label: 'Rejected', count: stats.rejected },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">Review and verify tenant payment slips</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
          <p className="text-2xl font-semibold mt-1">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-amber-500 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-semibold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-emerald-500 uppercase tracking-wide">Approved</p>
          <p className="text-2xl font-semibold mt-1">{stats.paid}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-red-500 uppercase tracking-wide">Rejected</p>
          <p className="text-2xl font-semibold mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              filter === f.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Payment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayments.map(payment => {
          const config = statusConfig[payment.status]
          const StatusIcon = config.icon
          
          return (
            <div 
              key={payment.id} 
              className="bg-card border border-border rounded-xl overflow-hidden flex flex-col"
            >
              {/* Slip Upload Area */}
              <div className="relative">
                {payment.slipUrl ? (
                  <div className="aspect-[4/3] bg-secondary relative overflow-hidden group">
                    <img 
                      src={getImageUrl(payment.slipUrl)} 
                      alt="Payment Slip" 
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        const url = getImageUrl(payment.slipUrl);
                        if (url) window.open(url, '_blank');
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-white text-xs font-medium">Click to expand</p>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={(e) => handleDrag(e, payment.id)}
                    onDragLeave={(e) => handleDrag(e, null)}
                    onDragOver={(e) => handleDrag(e, payment.id)}
                    onDrop={(e) => handleDrop(e, payment.id)}
                    className={cn(
                      "aspect-[4/3] border-2 border-dashed flex flex-col items-center justify-center transition-all",
                      dragActive === payment.id
                        ? "border-foreground/40 bg-secondary"
                        : "border-border bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <input
                      type="file"
                      id={`slip-${payment.id}`}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(payment.id, e)}
                      className="hidden"
                    />
                    <label htmlFor={`slip-${payment.id}`} className="cursor-pointer text-center p-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Upload payment slip</p>
                      <p className="text-xs text-muted-foreground mt-1">Drag & drop or click</p>
                    </label>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={cn(
                  "absolute top-3 right-3 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                  config.bg, config.text, config.border
                )}>
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col">
                {/* Room & Tenant */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Room {payment.invoice?.room?.number}</h3>
                  <p className="text-sm text-muted-foreground">{payment.tenant?.name}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span>{formatShortDate(payment.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                {payment.status === 'PENDING' && (
                  <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                    <Button
                      size="sm"
                      className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      onClick={() => handleStatusChange(payment.id, 'PAID')}
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 text-red-500 border-red-500/30 hover:bg-red-500/10 rounded-lg"
                      onClick={() => handleStatusChange(payment.id, 'REJECTED')}
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No payments found</h3>
          <p className="text-sm text-muted-foreground">No payments match the selected filter</p>
        </div>
      )}
    </div>
  )
}
