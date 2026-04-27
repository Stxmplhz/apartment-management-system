import { Button } from "@/components/ui/button";
import { User, Phone, Calendar } from "lucide-react";
import { cn, formatDateEng, formatCurrency } from "@/lib/utils";

export function LeaseCard({ lease, onOpenDetail }: any) {
  const isExpiringSoon = lease.endDate &&
    (new Date(lease.endDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000);

  return (
    <div className={cn(
      "bg-card border rounded-xl p-5 hover:border-border/80 transition-all shadow-sm",
      isExpiringSoon && lease.status === 'ACTIVE' ? "border-red-500/30" : "border-border"
    )}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-blue-500/25 flex items-center justify-center font-medium text-sm text-blue-300 flex-shrink-0">
            {lease.room.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-foreground">{lease.tenant.firstName} {lease.tenant.lastName}</p>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                lease.status === 'ACTIVE'
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  : "bg-secondary text-muted-foreground border-border"
              )}>{lease.status}</span>
              {isExpiringSoon && lease.status === 'ACTIVE' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/15 text-red-400 border border-red-500/20">
                  Expiring Soon
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-muted-foreground text-[11px]">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {lease.tenant.nationalId?.slice(-4)}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lease.tenant.phone}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 bg-secondary border border-border rounded-xl px-4 py-3">
          <DateInfo label="Start" date={formatDateEng(lease.startDate)} />
          <div className="w-px h-8 bg-border" />
          <DateInfo label="Expiry" date={lease.endDate ? formatDateEng(lease.endDate) : "Indefinite"} alert={isExpiringSoon && lease.status === 'ACTIVE'} />
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Rent</p>
            <p className="text-sm font-semibold text-blue-400">{formatCurrency(lease.agreedBaseRent)}</p>
          </div>
        </div>

        <button
          onClick={() => onOpenDetail(lease)}
          className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          View Contract
        </button>
      </div>
    </div>
  );
}

function DateInfo({ label, date, alert }: any) {
  return (
    <div>
      <p className={cn("text-[10px] uppercase tracking-wide mb-0.5", alert ? "text-red-400" : "text-muted-foreground")}>{label}</p>
      <p className={cn("text-sm font-medium", alert ? "text-red-400" : "text-foreground")}>{date}</p>
    </div>
  );
}
