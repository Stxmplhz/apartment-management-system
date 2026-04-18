// @ts-nocheck
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { 
  CheckCircle, Zap, Droplets, Loader2, 
  Calendar, Settings2, Search, X, DoorOpen 
} from "lucide-react"
import type { Room } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function MeterReadingPage() {
  const [occupiedRooms, setOccupiedRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [meterData, setMeterData] = useState<Record<string, any>>({})
  
  // States สำหรับการกรองและตั้งราคา
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFloor, setSelectedFloor] = useState<string>("all")
  const [elecRate, setElecRate] = useState("4.5")
  const [waterRate, setWaterRate] = useState("18")

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = async () => {
    try {
      setLoading(true)
      const roomsData = await api.meters.pending(selectedMonth) 
      setOccupiedRooms(roomsData)
      
      const initial: Record<string, any> = {}
      roomsData.forEach((room: any) => {
        initial[room.id] = {
          electricity: { 
            previous: room.baselineData.electricity, 
            current: room.recordedData.electricity?.toString() || "", 
            isSaved: room.isSaved 
          },
          water: { 
            previous: room.baselineData.water, 
            current: room.recordedData.water?.toString() || "", 
            isSaved: room.isSaved
          },
        }
      })
      setMeterData(initial)
    } catch (error) {
      toast.error('Failed to sync data')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Helper คำนวณ Usage แบบ Real-time
  const calculateUsage = (previous: number, current: string) => {
    const curr = parseFloat(current)
    if (isNaN(curr) || curr < previous) return { usage: 0, valid: false }
    return { usage: curr - previous, valid: true }
  }

  const updateMeter = (roomId: string, type: 'electricity' | 'water', value: string) => {
    setMeterData(prev => ({
      ...prev,
      [roomId]: { ...prev[roomId], [type]: { ...prev[roomId][type], current: value } },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)  
    try {
      const promises = occupiedRooms.map(room => {
        const data = meterData[room.id]
        if (!data || data.electricity.isSaved) return null
        if (!data.electricity.current || !data.water.current) return null

        return api.meters.bulkCreate({
          roomId: room.id,
          month: selectedMonth, 
          electricity: {
            previousValue: data.electricity.previous,
            currentValue: parseFloat(data.electricity.current),
            rateAtTime: parseFloat(elecRate)
          },
          water: {
            previousValue: data.water.previous,
            currentValue: parseFloat(data.water.current),
            rateAtTime: parseFloat(waterRate)
          }
        })
      })

      await Promise.all(promises.filter(Boolean))
      toast.success('Meter readings and rates finalized!')
      loadData()
    } catch (error) {
      toast.error('Failed to save readings')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter Logic
  const uniqueFloors = [...new Set(occupiedRooms.map(r => r.floor))].sort((a, b) => a - b)
  const filteredRooms = occupiedRooms.filter(r => {
    const matchesSearch = r.number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFloor = selectedFloor === "all" || r.floor.toString() === selectedFloor
    return matchesSearch && matchesFloor
  })

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="relative space-y-8 pb-32"> 
      {/* --- 1. Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Meter Entry</h1>
          <p className="text-muted-foreground mt-1">Record monthly electricity and water readings</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search Room..." className="pl-9 w-40 rounded-xl border-slate-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           </div>
           <Input 
           type="month" 
           value={selectedMonth} 
           onChange={(e) => setSelectedMonth(e.target.value)} 
           className="w-30 font-bold rounded-xl border-slate-200 bg-white" 
           />
        </div>
      </div>

      {/* --- 2. Configuration & Rate Info --- */}
      <Card className="p-4 bg-slate-50 border-slate-200 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1">
              <Zap className="h-3 w-3" /> Electricity Rate (THB/kWh)
            </Label>
            <Input 
            type="number" 
            step="0.1" 
            value={elecRate} 
            onChange={(e) => setElecRate(e.target.value)} 
            className="bg-white rounded-xl font-bold h-11" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
              <Droplets className="h-3 w-3" /> Water Rate (THB/Unit)
            </Label>
            <Input type="number" step="0.5" value={waterRate} onChange={(e) => setWaterRate(e.target.value)} className="bg-white rounded-xl font-bold h-11" />
          </div>
        </div>
      </Card>

      {/* --- 3. Floor Filter Tabs --- */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        <button
          onClick={() => setSelectedFloor("all")}
          className={cn(
            "px-6 py-2 text-xs font-bold rounded-xl transition-all",
            selectedFloor === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          All
        </button>
        {uniqueFloors.map(floor => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor.toString())}
            className={cn(
              "px-6 py-2 text-xs font-bold rounded-xl transition-all",
              selectedFloor === floor.toString() ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Floor {floor}
          </button>
        ))}
      </div>

      {/* --- 4. Room Meter List --- */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRooms.map(room => {
            const data = meterData[room.id]
            if (!data) return null
            const isSaved = data?.electricity.isSaved && data?.water.isSaved
            
            const elecCalc = calculateUsage(data.electricity.previous, data.electricity.current)
            const waterCalc = calculateUsage(data.water.previous, data.water.current)
            const totalCost = (elecCalc.valid ? elecCalc.usage * parseFloat(elecRate) : 0) + 
                            (waterCalc.valid ? waterCalc.usage * parseFloat(waterRate) : 0)

            return (
              <div 
                key={room.id} 
                className={cn(
                  "bg-card border rounded-2xl overflow-hidden transition-all shadow-sm",
                  isSaved ? "opacity-75 border-emerald-500/30 bg-emerald-50/20" : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                )}
              >
                <div className="flex items-center justify-between px-5 py-3 border-b bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-800">Room {room.number}</h3>
                    {isSaved && (
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase font-black">
                        <CheckCircle className="h-3 w-3" /> Recorded
                      </span>
                    )}
                  </div>
                  {(elecCalc.valid || waterCalc.valid) && !isSaved && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-black">Estimated</p>
                      <p className="font-black text-blue-600">{totalCost.toLocaleString()} ฿</p>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Electricity */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-600">
                        <Zap className="h-4 w-4 fill-amber-500" />
                        <span className="font-black text-xs uppercase">Electricity</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">Previous</Label>
                          <div className="h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center text-sm font-bold text-slate-600">
                            {data.electricity.previous}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">Current</Label>
                          <Input type="number" value={data.electricity.current} disabled={isSaved} onChange={e => updateMeter(room.id, 'electricity', e.target.value)} className="h-10 rounded-xl font-black border-slate-200 focus-visible:ring-amber-500" />
                        </div>
                      </div>
                    </div>

                    {/* Water */}
                    <div className="space-y-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Droplets className="h-4 w-4 fill-blue-500" />
                        <span className="font-black text-xs uppercase">Water</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">Previous</Label>
                          <div className="h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center text-sm font-bold text-slate-600">
                            {data.water.previous}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">Current</Label>
                          <Input 
                          type="number" 
                          value={data.water.current} 
                          disabled={isSaved} 
                          onChange={e => updateMeter(room.id, 'water', e.target.value)} 
                          className="h-10 rounded-xl font-black border-slate-200 focus-visible:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* --- Floating Save Button --- */}
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4 duration-500">
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
              <span className="text-lg">Save Changes</span>
              <span className="text-[10px] opacity-50 font-normal uppercase tracking-widest">Finalize Month {selectedMonth}</span>
            </div>
          </Button>
        </div>
      </form>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="font-black text-slate-300 uppercase tracking-widest">No rooms found</p>
        </div>
      )}
    </div>
  )
}