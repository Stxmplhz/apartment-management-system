import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle, XCircle, Loader2, ExternalLink, ShieldCheck } from "lucide-react"
import { cn, formatCurrency, formatDateEng, getImageUrl } from "@/lib/utils"

export function PaymentCard({ payment, dragActive, processingId, actions }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  const isProcessing = processingId === payment.id

  return (
    <Card className="rounded-[2rem] border-none shadow-md bg-white overflow-hidden hover:shadow-xl transition-all flex flex-col group">
      
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
          <a href={getImageUrl(payment.slipUrl)} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative cursor-zoom-in">
            <img src={getImageUrl(payment.slipUrl)} alt="Payment Slip" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
               <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span className="text-[10px] font-black uppercase text-slate-800">View Full Slip</span>
               </div>
            </div>
          </a>
        ) : (
          <div
            onDragEnter={(e) => actions.handleDrag(e, payment.id)}
            onDragLeave={(e) => actions.handleDrag(e, null)}
            onDragOver={(e) => actions.handleDrag(e, payment.id)}
            onDrop={(e) => actions.handleDrop(e, payment.id)}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center transition-all",
              dragActive === payment.id ? "bg-blue-50 border-2 border-blue-400 border-dashed" : ""
            )}
          >
            <input
              type="file" id={`slip-${payment.id}`} accept="image/*"
              onChange={(e) => actions.handleFileUpload(payment.id, e)} className="hidden"
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
                disabled={isProcessing}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200"
                onClick={() => actions.handleStatusChange(payment.id, 'PAID')}
              >
                {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve
              </Button>
              <Button
                variant="outline"
                disabled={isProcessing}
                className="flex-1 h-12 text-red-500 border-red-200 hover:bg-red-50 rounded-xl font-bold"
                onClick={() => actions.handleStatusChange(payment.id, 'REJECTED')}
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject
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
  )
}