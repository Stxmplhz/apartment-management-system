import { Button } from "@/components/ui/button"
import { Download, Zap, Droplets, CheckCircle2, Upload, Loader2 } from "lucide-react"
import { cn, formatCurrency, formatMonthName } from "@/lib/utils"
import { generateInvoicePDF } from "@/lib/pdf-service"
import { WATER_RATE, ELECTRICITY_RATE } from "@/lib/constants"

const statusStyle: Record<string, string> = {
  UNPAID:         "bg-red-50    text-red-600    border-red-100",
  OVERDUE:        "bg-red-100   text-red-700    border-red-200",
  PENDING_VERIFY: "bg-amber-50  text-amber-600  border-amber-100",
  PAID:           "bg-emerald-50 text-emerald-600 border-emerald-100",
}
const statusLabel: Record<string, string> = {
  UNPAID: "Unpaid", OVERDUE: "Overdue", PENDING_VERIFY: "Pending", PAID: "Paid"
}
const topBar: Record<string, string> = {
  UNPAID: "bg-red-400", OVERDUE: "bg-red-600", PENDING_VERIFY: "bg-amber-400", PAID: "bg-emerald-500"
}

export function InvoiceCard({ invoice, userRole, onMarkPaid, onOpenPay, isProcessing }: any) {
  const elecUsage = invoice.electricityUsage || (invoice.electricityCost / ELECTRICITY_RATE)
  const waterUsage = invoice.waterUsage || (invoice.waterCost / WATER_RATE)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      {/* Top color bar */}
      <div className={cn("h-1", topBar[invoice.status] ?? "bg-border")} />

      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500 text-white flex flex-col items-center justify-center flex-shrink-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <span className="text-[8px] opacity-70 leading-none">Rm</span>
            <span className="text-sm font-medium leading-tight">{invoice.lease?.room?.number}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{invoice.lease?.tenant?.firstName} {invoice.lease?.tenant?.lastName}</p>
            <p className="text-[11px] text-muted-foreground">{formatMonthName(invoice.month)}</p>
          </div>
        </div>
        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", statusStyle[invoice.status] ?? statusStyle.UNPAID)}>
          {statusLabel[invoice.status] ?? invoice.status}
        </span>
      </div>

      {/* Breakdown */}
      <div className="px-5 py-4 space-y-2.5 flex-1">
        <Row label="Base Rent" value={formatCurrency(invoice.baseRent)} />
        <Row label={`Electricity (${elecUsage.toFixed(0)} kWh)`} value={formatCurrency(invoice.electricityCost)} icon={<Zap className="h-3 w-3 text-amber-500" />} />
        <Row label={`Water (${waterUsage.toFixed(0)} m³)`} value={formatCurrency(invoice.waterCost)} icon={<Droplets className="h-3 w-3 text-blue-500" />} />
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total Due</span>
          <span className="text-lg font-medium text-blue-600" style={{ fontFamily: 'Lexend, sans-serif' }}>{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-border flex gap-2">
        <Button variant="outline" size="sm" className="rounded-lg h-9 flex-1 text-xs" onClick={() => generateInvoicePDF(invoice)}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
        </Button>
        {userRole === 'ADMIN' && invoice.status === 'UNPAID' && (
          <Button size="sm" disabled={isProcessing} onClick={() => onMarkPaid(invoice.id)}
            className="rounded-lg h-9 flex-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
            {isProcessing ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
            Mark Paid
          </Button>
        )}
        {userRole === 'TENANT' && (invoice.status === 'UNPAID' || invoice.status === 'PENDING_VERIFY') && (
          <Button size="sm" onClick={onOpenPay}
            className="rounded-lg h-9 flex-1 text-xs bg-foreground hover:bg-foreground/90 text-background">
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Pay
          </Button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}
