import { Button } from "@/components/ui/button"
import { Upload, CheckCircle, XCircle, Loader2, ExternalLink, ShieldCheck } from "lucide-react"
import { cn, formatCurrency, formatDateEng, getImageUrl } from "@/lib/utils"

const statusStyle: Record<string, string> = {
  PENDING:  "bg-amber-50  text-amber-600  border-amber-100",
  PAID:     "bg-emerald-50 text-emerald-600 border-emerald-100",
  REJECTED: "bg-red-50    text-red-600    border-red-100",
}
const topBar: Record<string, string> = {
  PENDING: "bg-amber-400", PAID: "bg-emerald-500", REJECTED: "bg-red-500",
}

export function PaymentCard({ payment, dragActive, processingId, actions }: any) {
  if (!payment?.id) return null
  const isProcessing = processingId === payment.id

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Top color bar */}
      <div className={cn("h-1", topBar[payment.status] ?? "bg-border")} />

      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500 text-white flex flex-col items-center justify-center flex-shrink-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <span className="text-[8px] opacity-70 leading-none">Rm</span>
            <span className="text-sm font-medium leading-tight">{payment.invoice?.lease?.room?.number ?? '-'}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{payment.tenant?.firstName} {payment.tenant?.lastName}</p>
            <p className="text-[11px] text-muted-foreground">{formatDateEng(payment.createdAt)}</p>
          </div>
        </div>
        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", statusStyle[payment.status] ?? statusStyle.PENDING)}>
          {payment.status === 'PAID' ? 'Approved' : payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Slip preview */}
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden border-b border-border">
        {payment.slipUrl ? (
          <a href={getImageUrl(payment.slipUrl)} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-zoom-in">
            <img src={getImageUrl(payment.slipUrl)} alt="Payment Slip" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-card/90 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-medium text-foreground">View Slip</span>
              </div>
            </div>
          </a>
        ) : (
          <div
            onDragEnter={(e) => actions.handleDrag(e, payment.id)}
            onDragLeave={(e) => actions.handleDrag(e, null)}
            onDragOver={(e) => actions.handleDrag(e, payment.id)}
            onDrop={(e) => actions.handleDrop(e, payment.id)}
            className={cn("w-full h-full flex flex-col items-center justify-center transition-all",
              dragActive === payment.id ? "bg-blue-50 border-2 border-blue-300 border-dashed" : ""
            )}
          >
            <input type="file" id={`slip-${payment.id}`} accept="image/*" onChange={(e) => actions.handleFileUpload(payment.id, e)} className="hidden" />
            <label htmlFor={`slip-${payment.id}`} className="cursor-pointer flex flex-col items-center gap-2 p-6 w-full h-full justify-center">
              <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Drop slip here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </label>
          </div>
        )}
      </div>

      {/* Amount + actions */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Transfer Amount</span>
          <span className="text-xl font-medium text-blue-600" style={{ fontFamily: 'Lexend, sans-serif' }}>{formatCurrency(payment.amount)}</span>
        </div>

        {payment.status === 'PENDING' ? (
          <div className="flex gap-2">
            <Button disabled={isProcessing} onClick={() => actions.handleStatusChange(payment.id, 'PAID')}
              className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium">
              {isProcessing ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
              Approve
            </Button>
            <Button variant="outline" disabled={isProcessing} onClick={() => actions.handleStatusChange(payment.id, 'REJECTED')}
              className="flex-1 h-9 text-red-500 border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium">
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
            </Button>
          </div>
        ) : (
          <div className={cn("p-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-medium",
            payment.status === 'PAID' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
          )}>
            {payment.status === 'PAID' ? <ShieldCheck className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {payment.status === 'PAID' ? 'Verified Successfully' : 'Slip Rejected'}
          </div>
        )}
      </div>
    </div>
  )
}
