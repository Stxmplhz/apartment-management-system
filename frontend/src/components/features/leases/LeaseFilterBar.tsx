import { cn } from "@/lib/utils";

export function LeaseFilterBar({ filters, uniqueFloors }: any) {
  const statuses = ['all', 'ACTIVE', 'TERMINATED', 'COMPLETED'];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => filters.setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                filters.statusFilter === status ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {status === 'all' ? 'All Contracts' : status}
            </button>
          ))}
        </div>

        {/* Floor Select */}
        <select 
          value={filters.floorFilter}
          onChange={(e) => filters.setFloorFilter(e.target.value)}
          className="h-9 px-4 rounded-xl bg-slate-100 border-none text-[10px] font-black uppercase text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <option value="all">All Floors</option>
          {uniqueFloors.map((f: any) => <option key={f} value={f.toString()}>Floor {f}</option>)}
        </select>
      </div>

      {/* Sorting Select */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
        <select 
          value={filters.sortBy} 
          onChange={(e) => filters.setSortBy(e.target.value)} 
          className="h-7 px-3 rounded-lg bg-transparent border-none text-[10px] font-black uppercase text-slate-600 focus:ring-0 outline-none cursor-pointer"
        >
          <option value="newest">Latest Start</option>
          <option value="oldest">Oldest Start</option>
          <option value="expiring">Expiring Soon</option>
          <option value="room">By Room #</option>
        </select>
      </div>
    </div>
  );
}