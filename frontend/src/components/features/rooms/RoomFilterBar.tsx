import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Banknote, ArrowRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function RoomFilterBar({ filters, stats, onAddClick }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Room Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Filter by status, number, or price range</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search #"
              className="pl-8 w-28 h-9 rounded-lg bg-secondary border-border text-sm"
              value={filters.searchQuery}
              onChange={(e) => filters.setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg border border-border">
            <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
            <Input type="number" placeholder="Min" className="w-16 h-7 bg-transparent border-none p-0 text-center focus-visible:ring-0 text-sm" value={filters.minPrice} onChange={(e) => filters.setMinPrice(e.target.value)} />
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Input type="number" placeholder="Max" className="w-16 h-7 bg-transparent border-none p-0 text-center focus-visible:ring-0 text-sm" value={filters.maxPrice} onChange={(e) => filters.setMaxPrice(e.target.value)} />
          </div>
          <Button onClick={onAddClick} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9">
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
