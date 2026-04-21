import { useMeters } from "@/hooks/useMeters"
import { MeterFilterBar } from "@/components/features/meters/MeterFilterBar"
import { MeterCard } from "@/components/features/meters/MeterCard"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"

export default function MeterReadingPage() {
  const { 
    filteredRooms, meterData, loading, submitting, 
    uniqueFloors, stats, rates, filters, actions 
  } = useMeters()

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
  }

  return (
    <div className="relative space-y-8 pb-32"> 
      <MeterFilterBar 
        stats={stats} 
        filters={filters} 
        uniqueFloors={uniqueFloors} 
      />

      <form onSubmit={actions.handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRooms.map(room => {
            const data = meterData[room.id]
            if (!data) return null
            
            return (
              <MeterCard 
                key={room.id}
                room={room}
                data={data}
                rates={rates}
                onUpdate={actions.updateMeter}
                calculateUsage={actions.calculateUsage}
              />
            )
          })}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-sm">
            No rooms match your search
          </div>
        )}

        {/* Floating Save Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            type="submit" 
            disabled={submitting} 
            className="h-16 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all active:scale-95 group"
          >
            {submitting ? (
              <Loader2 className="animate-spin mr-3 h-5 w-5" />
            ) : (
              <CheckCircle className="mr-3 h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            )}
            <div className="flex flex-col items-start leading-tight">
              <span className="text-lg">Finalize Update</span>
              <span className="text-[10px] opacity-50 font-normal uppercase">{filters.selectedMonth} cycle</span>
            </div>
          </Button>
        </div>
      </form>
    </div>
  )
}