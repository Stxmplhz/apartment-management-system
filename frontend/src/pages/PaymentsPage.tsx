// @ts-nocheck
import { useState, useCallback, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn, formatCurrency, formatDateEng, getImageUrl } from "@/lib/utils"
import { 
  Upload, Check, X, Clock, CheckCircle, XCircle, 
  Loader2, Search, Calendar, User, Home, ExternalLink, ShieldCheck, Wallet
} from "lucide-react"
import type { Payment, PaymentStatus } from "@/lib/types"
import { toast } from "sonner"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [floorFilter, setFloorFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest") 
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const data = await api.payments.list()
      setPayments(data)
    } catch (error) {
      console.error('Failed to load payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const processedPayments = payments
    .filter(p => {
      const roomNum = p.invoice?.lease?.room?.number || ""
      const tenantName = p.tenant?.firstName || ""
      const floor = p.invoice?.lease?.room?.floor?.toString() || ""

      const matchesSearch = roomNum.includes(searchQuery) || tenantName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      const matchesFloor = floorFilter === 'all' || floor === floorFilter
      
      return matchesSearch && matchesStatus && matchesFloor
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      const roomA = a.invoice?.lease?.room?.number || ""
      const roomB = b.invoice?.lease?.room?.number || ""
      return roomA.localeCompare(roomB, undefined, { numeric: true })
    })

  const uniqueFloors = [...new Set(payments.map(p => p.invoice?.lease?.room?.floor))].filter(Boolean).sort()

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    paid: payments.filter(p => p.status === 'PAID').length,
    rejected: payments.filter(p => p.status === 'REJECTED').length,
  }

  const handleDrag = useCallback((e: React.DragEvent, paymentId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(paymentId)
    else if (e.type === "dragleave") setDragActive(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, paymentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const url = URL.createObjectURL(file)
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, slipUrl: url } : p))
    }
  }, [])

  const handleFileUpload = (paymentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, slipUrl: url } : p))
    }
  }

  const handleStatusChange = async (paymentId: string, status: PaymentStatus) => {
    try {
      setProcessingId(paymentId)
      await api.payments.verify(paymentId, status) 
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status } : p))
      toast.success(status === 'PAID' ? 'Payment Approved!' : 'Payment Rejected')
    } catch (error) {
      toast.error('Failed to update payment status')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  if (loading && payments.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Payment Verification</h1>
          <p className="text-muted-foreground text-sm font-medium text-slate-400">
            Awaiting Verification: <span className="text-amber-500 font-bold">{stats.pending} slips</span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search room or tenant..." 
              className="pl-10 h-12 rounded-2xl bg-slate-50 border-none font-medium focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters & Sorters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
           {/* Status Tabs */}
           <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
            {['all', 'PENDING', 'PAID', 'REJECTED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                  statusFilter === s ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {s === 'all' ? 'All Slips' : s === 'PAID' ? 'Approved' : s}
              </button>
            ))}
          </div>

          {/* Floor Filter */}
          <select 
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="h-9 px-4 rounded-xl bg-slate-100 border-none text-[10px] font-black uppercase text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">All Floors</option>
            {uniqueFloors.map(f => <option key={f} value={f.toString()}>Floor {f}</option>)}
          </select>
        </div>

        {/* Sort Sorter */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
           <select 
             value={sortBy} 
             onChange={(e) => setSortBy(e.target.value)} 
             className="h-7 px-3 rounded-lg bg-transparent border-none text-[10px] font-black uppercase text-slate-600 focus:ring-0 outline-none cursor-pointer"
           >
             <option value="newest">Latest Uploads</option>
             <option value="oldest">Oldest Uploads</option>
             <option value="room">By Room #</option>
           </select>
        </div>
      </div>

      {/* Payment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedPayments.map(payment => (
          <Card key={payment.id} className="rounded-[2rem] border-none shadow-md bg-white overflow-hidden hover:shadow-xl transition-all flex flex-col group">
            
            {/* Header */}
            <div className="px-6 py-5 border-b bg-slate-50/50 flex justify-between items-start">
              <div className="flex gap-4 items-center">
                 <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex flex-col items-center justify-center font-black">
                   <span className="text-[8px] opacity-60 uppercase leading-none">Room</span>
                   <span className="text-lg leading-tight">{payment.invoice?.lease?.room?.number || '-'}</span>
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">{payment.tenant?.firstName} {payment.tenant?.lastName}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDateEng(payment.createdAt)}</p>
                 </div>
              </div>
              <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border", getStatusColor(payment.status))}>
                {payment.status}
              </span>
            </div>

            {/* Slip Upload / Preview Area */}
            <div className="relative aspect-[4/3] bg-slate-100 border-b border-slate-100 overflow-hidden">
              {payment.slipUrl ? (
                <a 
                  href={getImageUrl(payment.slipUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full h-full relative cursor-zoom-in"
                >
                  <img 
                    src={getImageUrl(payment.slipUrl)} 
                    alt="Payment Slip" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                     <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <span className="text-[10px] font-black uppercase text-slate-800">View Full Slip</span>
                     </div>
                  </div>
                </a>
              ) : (
                <div
                  onDragEnter={(e) => handleDrag(e, payment.id)}
                  onDragLeave={(e) => handleDrag(e, null)}
                  onDragOver={(e) => handleDrag(e, payment.id)}
                  onDrop={(e) => handleDrop(e, payment.id)}
                  className={cn(
                    "w-full h-full flex flex-col items-center justify-center transition-all",
                    dragActive === payment.id ? "bg-blue-50 border-2 border-blue-400 border-dashed" : ""
                  )}
                >
                  <input
                    type="file"
                    id={`slip-${payment.id}`}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(payment.id, e)}
                    className="hidden"
                  />
                  <label htmlFor={`slip-${payment.id}`} className="cursor-pointer text-center p-6 w-full h-full flex flex-col justify-center">
                    <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Drop slip here</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">or click to browse</p>
                  </label>
                </div>
              )}
            </div>

            {/* Bottom Section (Amount & Actions) */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-end mb-6">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transfer Amount</span>
                 <span className="text-2xl font-black text-blue-600">{formatCurrency(payment.amount)}</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto">
                {payment.status === 'PENDING' ? (
                  <div className="flex gap-2">
                    <Button
                      disabled={processingId === payment.id}
                      className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200"
                      onClick={() => handleStatusChange(payment.id, 'PAID')}
                    >
                      {processingId === payment.id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      disabled={processingId === payment.id}
                      className="flex-1 h-12 text-red-500 border-red-200 hover:bg-red-50 rounded-xl font-bold"
                      onClick={() => handleStatusChange(payment.id, 'REJECTED')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className={cn("p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold", 
                    payment.status === 'PAID' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
                  )}>
                     {payment.status === 'PAID' ? <ShieldCheck className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                     {payment.status === 'PAID' ? 'Verified Successfully' : 'Slip Rejected'}
                  </div>
                )}
              </div>
            </div>

          </Card>
        ))}
      </div>

      {processedPayments.length === 0 && (
        <div className="text-center py-32 bg-slate-50 border-2 border-dashed rounded-[3rem]">
          <Wallet className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="font-black text-slate-300 uppercase tracking-widest text-sm">No payment records found</p>
        </div>
      )}
    </div>
  )
}