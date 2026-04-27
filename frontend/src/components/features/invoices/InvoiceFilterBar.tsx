import { cn } from "@/lib/utils"

export function InvoiceFilterBar({ filters, uniqueFloors }: any) {
  const statusOptions = ['all', 'UNPAID', 'PENDING_VERIFY', 'PAID']
  const statusLabel: Record<string, string> = { all: 'All', UNPAID: 'Unpaid', PENDING_VERIFY: 'Pending', PAID: 'Paid' }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg border border-border">
          {statusOptions.map(s => (
            <button key={s} onClick={() => filters.setStatusFilter(s)}
              className={cn("px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                filters.statusFilter === s ? "bg-card text-blue-600 shadow-sm border border-blue-100" : "text-muted-foreground hover:text-foreground"
              )}>
              {statusLabel[s]}
            </button>
          ))}
        </div>
        <select value={filters.floorFilter} onChange={(e) => filters.setFloorFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-blue-400 cursor-pointer">
          <option value="all">All Floors</option>
          {uniqueFloors.map((f: any) => <option key={f} value={f.toString()}>Floor {f}</option>)}
        </select>
      </div>
      <select value={filters.sortBy} onChange={(e) => filters.setSortBy(e.target.value)}
        className="h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-blue-400 cursor-pointer">
        <option value="newest">Latest Bills</option>
        <option value="oldest">Oldest Bills</option>
        <option value="room">By Room #</option>
      </select>
    </div>
  )
}
