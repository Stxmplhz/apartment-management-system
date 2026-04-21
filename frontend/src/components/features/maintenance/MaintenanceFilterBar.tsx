import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MaintenanceFilterBar({ filters, uniqueFloors }: any) {
  const statuses = ['all', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
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
              {s === 'all' ? 'All Jobs' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <select 
          value={filters.floorFilter}
          onChange={(e) => filters.setFloorFilter(e.target.value)}
          className="h-9 px-4 rounded-xl bg-slate-100 border-none text-[10px] font-black uppercase text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <option value="all">All Floors</option>
          {uniqueFloors.map((f: any) => <option key={f} value={f.toString()}>Floor {f}</option>)}
        </select>
      </div>
      
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
         <Button variant={filters.sortBy === 'newest' ? 'secondary' : 'ghost'} size="sm" className="text-[10px] font-black rounded-lg h-7" onClick={() => filters.setSortBy('newest')}>LATEST</Button>
         <Button variant={filters.sortBy === 'oldest' ? 'secondary' : 'ghost'} size="sm" className="text-[10px] font-black rounded-lg h-7" onClick={() => filters.setSortBy('oldest')}>OLDEST</Button>
      </div>
    </div>
  )
}