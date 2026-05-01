import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Banknote, ArrowRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function RoomFilterBar({ filters, stats, onAddClick }: any) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Room Directory</h1>
          <p className="text-xs text-muted-foreground mt-1">Filter by status, number, or price range</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search #"
              className="pl-9 w-32 h-10 rounded-xl bg-secondary border-border text-sm focus:ring-2 focus:ring-blue-500/20"
              value={filters.searchQuery}
              onChange={(e) => filters.setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-xl border border-border h-10">
            <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
            <Input type="number" placeholder="Min" className="w-16 h-7 bg-transparent border-none p-0 text-center focus-visible:ring-0 text-sm" value={filters.minPrice} onChange={(e) => filters.setMinPrice(e.target.value)} />
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Input type="number" placeholder="Max" className="w-16 h-7 bg-transparent border-none p-0 text-center focus-visible:ring-0 text-sm" value={filters.maxPrice} onChange={(e) => filters.setMaxPrice(e.target.value)} />
          </div>
          <Button onClick={onAddClick} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-10 px-4 shadow-lg shadow-blue-500/20">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Unit
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg w-fit border border-border">
        {stats.map((f: any) => (
          <button
            key={f.value}
            onClick={() => filters.setFilter(f.value)}
            className={cn(
              "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
              filters.filter === f.value
                ? "bg-card text-blue-600 shadow-sm border border-blue-100"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label} <span className="ml-1 opacity-50">{f.count}</span>
          </button>
        ))}
        {(filters.minPrice || filters.maxPrice) && (
          <Button variant="ghost" size="sm" onClick={() => { filters.setMinPrice(""); filters.setMaxPrice(""); }} className="h-7 text-[10px] text-red-500 hover:bg-red-50">Reset</Button>
        )}
      </div>
    </div>
  )
}
