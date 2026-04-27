import { useState } from "react"
import { useLeases } from "@/hooks/useLeases"
import { LeaseDetailModal } from "@/components/features/leases/LeaseDetailModal"
import { LeaseFilterBar } from "@/components/features/leases/LeaseFilterBar"
import { Input } from "@/components/ui/input"
import { Search, Loader2, FileText, User, Phone } from "lucide-react"
import { cn, formatDateEng } from "@/lib/utils"
import type { Lease } from "@/lib/types"

const statusStyle: Record<string, string> = {
  ACTIVE:     "bg-emerald-50 text-emerald-600 border-emerald-100",
  TERMINATED: "bg-red-50    text-red-600    border-red-100",
  COMPLETED:  "bg-secondary  text-muted-foreground border-border",
}

export default function LeaseManagementPage() {
  const { processedLeases, loading, filters, uniqueFloors, actions } = useLeases()
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null)

  if (loading && processedLeases.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 h-6 w-6" /></div>
  }

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Lease Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {processedLeases.filter(l => l.status === 'ACTIVE').length} active ·{' '}
            {processedLeases.length} total contracts
          </p>
        </div>
        <div className="relative w-full md:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tenant or room..."
            className="pl-9 h-9 rounded-lg bg-secondary border-border text-sm"
            value={filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
          />
        </div>
      </div>

      <LeaseFilterBar filters={filters} uniqueFloors={uniqueFloors} />

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Room</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tenant</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Start Date</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">End Date</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Duration</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {processedLeases.map((lease, i) => {
                const isExpiringSoon = lease.endDate &&
                  (new Date(lease.endDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) &&
                  lease.status === 'ACTIVE'

                return (
                  <tr
                    key={lease.id}
                    className={cn(
                      "border-b border-border last:border-0 hover:bg-secondary/40 transition-colors cursor-pointer",
                      isExpiringSoon && "bg-red-50/40 hover:bg-red-50/60"
                    )}
                    onClick={() => setSelectedLease(lease)}
                  >
                    {/* Room */}
                    <td className="px-5 py-4">
                      <div className="h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {lease.room.number}
                      </div>
                    </td>

                    {/* Tenant */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0">
                          {lease.tenant.firstName[0]}{lease.tenant.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{lease.tenant.firstName} {lease.tenant.lastName}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5" />{lease.tenant.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Start */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{formatDateEng(lease.startDate)}</span>
                    </td>

                    {/* End */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={cn("text-sm", isExpiringSoon ? "text-red-500 font-medium" : "text-muted-foreground")}>
                        {lease.endDate ? formatDateEng(lease.endDate) : "Indefinite"}
                        {isExpiringSoon && <span className="ml-1.5 text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full border border-red-200">Expiring</span>}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">
                        {actions.getLeaseAge(lease.startDate)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", statusStyle[lease.status] ?? statusStyle.COMPLETED)}>
                        {lease.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLease(lease)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="h-3 w-3" /> View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {processedLeases.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No leases found</p>
          </div>
        )}
      </div>

      {selectedLease && (
        <LeaseDetailModal
          lease={selectedLease}
          onClose={() => setSelectedLease(null)}
          onRefresh={actions.refresh}
          getLeaseAge={actions.getLeaseAge}
        />
      )}
    </div>
  )
}
