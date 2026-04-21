import { cn } from "@/lib/utils";

export function InvoiceFilterBar({ filters, uniqueFloors }: any) {
  const statusOptions = ['all', 'UNPAID', 'PENDING_VERIFY', 'PAID'];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => filters.setStatusFilter(s)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                filters.statusFilter === s ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {s === 'all' ? 'All Bills' : s === 'UNPAID' ? 'Not Paid' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Floor Select */}
        <select 
          value={filters.floorFilter}
          onChange={(e) => filters.setFloorFilter(e.target.value)}
          className="h-9 px-4 rounded-xl bg-slate-100 border-none text-[10px] font-black uppercase text-slate-600 outline-none cursor-pointer"
        >
          <option value="all">All Floors</option>
          {uniqueFloors.map((f: any) => <option key={f} value={f.toString()}>Floor {f}</option>)}
        </select>
      </div>

      {/* Sorting */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
        <select 
          value={filters.sortBy} 
          onChange={(e) => filters.setSortBy(e.target.value)} 
          className="h-7 px-3 rounded-lg bg-transparent border-none text-[10px] font-black uppercase text-slate-600 outline-none cursor-pointer"
        >
          <option value="newest">Latest Bills</option>
          <option value="oldest">Oldest Bills</option>
          <option value="room">By Room #</option>
        </select>
      </div>
    </div>
  );
}