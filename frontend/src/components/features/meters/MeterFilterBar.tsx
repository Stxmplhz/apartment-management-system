import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function MeterFilterBar({ stats, filters, uniqueFloors }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meter Entry</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">
                {stats.saved} Saved
             </span>
             <span className="flex items-center gap-1 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">
                {stats.todo} To Do
             </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search Room..." 
                className="pl-9 w-40 rounded-xl bg-white" 
                value={filters.searchQuery} 
                onChange={(e) => filters.setSearchQuery(e.target.value)} 
              />
           </div>
           <Input 
             type="month" 
             value={filters.selectedMonth} 
             onChange={(e) => filters.setSelectedMonth(e.target.value)} 
             className="w-40 font-bold rounded-xl bg-white" 
           />
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        <button type="button" onClick={() => filters.setSelectedFloor("all")} className={cn("px-5 py-1.5 text-xs font-bold rounded-xl transition-all", filters.selectedFloor === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}>All</button>
        {uniqueFloors.map((f: any) => (
          <button type="button" key={f} onClick={() => filters.setSelectedFloor(f.toString())} className={cn("px-5 py-1.5 text-xs font-bold rounded-xl transition-all", filters.selectedFloor === f.toString() ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}>Floor {f}</button>
        ))}
      </div>
    </div>
  )
}