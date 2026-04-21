import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Banknote, ArrowRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function RoomFilterBar({ filters, stats, onAddClick }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Room Directory</h1>
          <p className="text-muted-foreground text-sm">Filter by status, number, or price range</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search #" 
              className="pl-9 w-[110px] rounded-2xl bg-slate-50 border-none focus-visible:ring-blue-500"
              value={filters.searchQuery}
              onChange={(e) => filters.setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-2xl border border-slate-100">
            <Banknote className="h-4 w-4 text-slate-400" />
            <Input 
              type="number" placeholder="Min" 
              className="w-[70px] h-8 bg-transparent border-none p-0 text-center focus-visible:ring-0"
              value={filters.minPrice} onChange={(e) => filters.setMinPrice(e.target.value)}
            />
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <Input 
              type="number" placeholder="Max" 
              className="w-[70px] h-8 bg-transparent border-none p-0 text-center focus-visible:ring-0"
              value={filters.maxPrice} onChange={(e) => filters.setMaxPrice(e.target.value)}
            />
          </div>

          <Button onClick={onAddClick} className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100">
            <Plus className="h-4 w-4 mr-2" /> Add Unit
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
        {stats.map((f: any) => (
          <button
            key={f.value}
            onClick={() => filters.setFilter(f.value)}
            className={cn(
              "px-5 py-2 text-xs font-bold rounded-xl transition-all uppercase tracking-tighter",
              filters.filter === f.value ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-900"
            )}
          >
            {f.label} <span className="ml-1 opacity-40">{f.count}</span>
          </button>
        ))}
        {(filters.minPrice || filters.maxPrice) && (
           <Button variant="ghost" size="sm" onClick={() => {filters.setMinPrice(""); filters.setMaxPrice("");}} className="h-7 text-[10px] text-red-500 hover:bg-red-50">Reset Price</Button>
        )}
      </div>
    </div>
  )
}