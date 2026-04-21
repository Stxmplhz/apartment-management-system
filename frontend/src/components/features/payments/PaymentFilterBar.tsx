import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function PaymentFilterBar({ stats, filters, uniqueFloors }: any) {
  const statuses = ['all', 'PENDING', 'PAID', 'REJECTED']

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Payment Verification</h1>
          <p className="text-muted-foreground text-sm font-medium text-slate-400">
            Awaiting Verification: <span className="text-amber-500 font-bold">{stats.pending} slips</span>
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search room or tenant..." 
            className="pl-10 h-12 rounded-2xl bg-slate-50 border-none font-medium focus-visible:ring-blue-500"
            value={filters.searchQuery}
            onChange={(e) => filters.setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => filters.setStatusFilter(s)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                  filters.statusFilter === s ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {s === 'all' ? 'All Slips' : s === 'PAID' ? 'Approved' : s}
              </button>
            ))}
          </div>

          {/* Floor Filter */}
          <select 
            value={filters.floorFilter}
            onChange={(e) => filters.setFloorFilter(e.target.value)}
            className="h-9 px-4 rounded-xl bg-slate-100 border-none text-[10px] font-black uppercase text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">All Floors</option>
            {uniqueFloors.map((f: any) => <option key={f} value={f.toString()}>Floor {f}</option>)}
          </select>
        </div>

        {/* Sort Sorter */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
           <select 
             value={filters.sortBy} 
             onChange={(e) => filters.setSortBy(e.target.value)} 
             className="h-7 px-3 rounded-lg bg-transparent border-none text-[10px] font-black uppercase text-slate-600 focus:ring-0 outline-none cursor-pointer"
           >
             <option value="newest">Latest Uploads</option>
             <option value="oldest">Oldest Uploads</option>
             <option value="room">By Room #</option>
           </select>
        </div>
      </div>
    </div>
  )
}