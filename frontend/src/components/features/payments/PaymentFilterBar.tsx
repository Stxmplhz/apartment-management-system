import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function PaymentFilterBar({ stats, filters, uniqueFloors }: any) {
  const statuses = ['all', 'PENDING', 'PAID', 'REJECTED']

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Payment Verification</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Awaiting verification: <span className="text-amber-500 font-semibold">{stats.pending} slips</span>
          </p>
        </div>
        <div className="relative w-full md:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search room or tenant..." className="pl-9 h-9 rounded-lg bg-secondary border-border text-sm" value={filters.searchQuery} onChange={(e) => filters.setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg border border-border">
            {statuses.map(s => (
              <button key={s} onClick={() => filters.setStatusFilter(s)}
                className={cn("px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                  filters.statusFilter === s ? "bg-card text-blue-600 shadow-sm border border-blue-100" : "text-muted-foreground hover:text-foreground"
                )}>
                {s === 'all' ? 'All' : s === 'PAID' ? 'Approved' : s.charAt(0) + s.slice(1).toLowerCase()}
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
          <option value="newest">Latest Uploads</option>
          <option value="oldest">Oldest Uploads</option>
          <option value="room">By Room #</option>
        </select>
      </div>
    </div>
  )
}
