import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone } from "lucide-react";
import { cn, formatDateEng } from "@/lib/utils";

export function LeaseCard({ lease, onOpenDetail }: any) {
  const isExpiringSoon = lease.endDate && 
    (new Date(lease.endDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000);

  return (
    <Card className={cn(
      "p-5 hover:shadow-xl transition-all border shadow-md bg-white rounded-[2rem]",
      isExpiringSoon && lease.status === 'ACTIVE' ? "border-red-200 bg-red-50/10" : "border-slate-100"
    )}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 text-white flex flex-col items-center justify-center font-black">
            <span className="text-[10px] opacity-60 uppercase">Room</span>{lease.room.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-xl">{lease.tenant.firstName} {lease.tenant.lastName}</p>
              <span className={cn(
                "text-[9px] px-3 py-1 rounded-full font-black uppercase",
                lease.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              )}>{lease.status}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs font-bold">
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> ID: {lease.tenant.nationalId?.slice(-4)}</span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {lease.tenant.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 max-w-sm hidden lg:block">
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <DateInfo label="Start" date={formatDateEng(lease.startDate)} />
            <DateInfo label="Expiry" date={lease.endDate ? formatDateEng(lease.endDate) : "Indefinite"} alert={isExpiringSoon} />
          </div>
        </div>

        <Button onClick={() => onOpenDetail(lease)} className="rounded-2xl h-12 px-6 bg-slate-900 font-bold">View Contract</Button>
      </div>
    </Card>
  );
}

function DateInfo({ label, date, alert }: any) {
  return (
    <div>
      <p className={cn("text-[9px] font-black uppercase mb-1", alert ? "text-red-500" : "text-slate-400")}>{label}</p>
      <p className={cn("text-sm font-bold", alert ? "text-red-600" : "text-slate-700")}>{date}</p>
    </div>
  );
}