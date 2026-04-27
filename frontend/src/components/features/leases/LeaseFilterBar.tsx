import { cn } from "@/lib/utils"

export function LeaseFilterBar({ filters, uniqueFloors }: any) {
  const statuses = ['all', 'ACTIVE', 'TERMINATED', 'COMPLETED']

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg border border-border">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => filters.setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                filters.statusFilter === s
                  ? "bg-card text-blue-600 shadow-sm border border-blue-100"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Floor */}
        <select
          value={filters.floorFilter}
          onChange={(e) => filters.setFloorFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-blue-400 transition-colors cursor-pointer"
        >
          <option value="all">All Floors</option>
          {uniqueFloors.map((f: any) => <option key={f} value={f.toString()}>Floor {f}</option>)}
        </select>
      </div>

      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) => filters.setSortBy(e.target.value)}
        className="h-9 px-3 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-blue-400 transition-colors cursor-pointer"
      >
        <option value="newest">Latest Start</option>
        <option value="oldest">Oldest Start</option>
        <option value="expiring">Expiring Soon</option>
        <option value="room">By Room #</option>
      </select>
    </div>
  )
}
