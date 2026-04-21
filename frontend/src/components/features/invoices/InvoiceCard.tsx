import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Zap, Droplets, CheckCircle2, Upload, Loader2 } from "lucide-react";
import { cn, formatCurrency, formatMonthName } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf-service";
import { WATER_RATE, ELECTRICITY_RATE } from "@/lib/constants";

export function InvoiceCard({ invoice, userRole, onMarkPaid, onOpenPay, isProcessing }: any) {
  const elecUsage = invoice.electricityUsage || (invoice.electricityCost / ELECTRICITY_RATE);
  const waterUsage = invoice.waterUsage || (invoice.waterCost / WATER_RATE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID': return 'bg-red-100 text-red-700 border-red-200';
      case 'OVERDUE': return 'bg-red-500 text-white border-red-600 shadow-md';
      case 'PENDING_VERIFY': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <Card className="rounded-[2rem] border-none shadow-md bg-white overflow-hidden hover:shadow-xl transition-all group flex flex-col">
      <div className="px-6 py-5 border-b bg-slate-50/50 flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex flex-col items-center justify-center font-black">
            <span className="text-[8px] opacity-60 uppercase">Room</span>
            <span className="text-lg leading-tight">{invoice.lease?.room?.number}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{invoice.lease?.tenant?.firstName} {invoice.lease?.tenant?.lastName}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatMonthName(invoice.month)}</p>
          </div>
        </div>
        <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase border", getStatusColor(invoice.status))}>
          {invoice.status === 'PENDING_VERIFY' ? 'Checking' : invoice.status}
        </span>
      </div>

      <div className="p-6 space-y-3 text-sm flex-1">
        <DetailRow label="Base Rent" value={formatCurrency(invoice.baseRent)} />
        <DetailRow 
          label={`Elec (${elecUsage.toFixed(0)} u)`} 
          value={formatCurrency(invoice.electricityCost)} 
          icon={<Zap className="h-3 w-3"/>}
          variant="amber"
        />
        <DetailRow 
          label={`Water (${waterUsage.toFixed(0)} u)`} 
          value={formatCurrency(invoice.waterCost)} 
          icon={<Droplets className="h-3 w-3"/>}
          variant="blue"
        />
        <div className="flex justify-between items-end pt-4">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Due</span>
          <span className="text-2xl font-black text-blue-600">{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      <div className="p-4 bg-slate-50 flex gap-2">
        <Button variant="outline" className="rounded-xl flex-1 bg-white" onClick={() => generateInvoicePDF(invoice)}>
          <Download className="h-4 w-4 mr-2"/> PDF
        </Button>

        {userRole === 'ADMIN' && invoice.status === 'UNPAID' && (
          <Button className="rounded-xl flex-1 bg-emerald-600" onClick={() => onMarkPaid(invoice.id)} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 mr-2"/>}
            Mark Paid
          </Button>
        )}

        {userRole === 'TENANT' && (invoice.status === 'UNPAID' || invoice.status === 'PENDING_VERIFY') && (
          <Button className="rounded-xl flex-1 bg-slate-900" onClick={onOpenPay}>
            <Upload className="h-4 w-4 mr-2"/> Pay
          </Button>
        )}
      </div>
    </Card>
  );
}

// Helper small component
function DetailRow({ label, value, icon, variant }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
      <span className={cn(
        "flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-lg text-xs",
        variant === 'amber' ? 'text-amber-600 bg-amber-50' : variant === 'blue' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
      )}>
        {icon} {label}
      </span>
      <span className="font-bold text-slate-700">{value}</span>
    </div>
  );
}