// @ts-nocheck
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { 
  CheckCircle, Zap, Droplets, Loader2, 
  Calendar, Search, X, DoorOpen, AlertCircle 
} from "lucide-react"
import type { Room } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function MeterReadingPage() {
  const [occupiedRooms, setOccupiedRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [meterData, setMeterData] = useState<Record<string, any>>({})
  
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

  const calculateUsage = (previous: number, current: string) => {
    if (current === "") return { usage: 0, valid: true, empty: true }
    const curr = parseFloat(current)
    if (isNaN(curr) || curr < previous) return { usage: 0, valid: false, empty: false }
    return { usage: curr - previous, valid: true, empty: false }
  }

  const updateMeter = (roomId: string, type: 'electricity' | 'water', value: string) => {
    setMeterData(prev => ({
      ...prev,
      [roomId]: { ...prev[roomId], [type]: { ...prev[roomId][type], current: value } },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. เช็คว่ากรอกเลขผิดไหม (ห้ามน้อยกว่าเดือนก่อน)
    const invalidRooms = []
    occupiedRooms.forEach(room => {
      const data = meterData[room.id]
      if (data.electricity.current !== "" || data.water.current !== "") {
        const eCalc = calculateUsage(data.electricity.previous, data.electricity.current)
        const wCalc = calculateUsage(data.water.previous, data.water.current)
        if (!eCalc.valid || !wCalc.valid) {
          invalidRooms.push(room.number)
        }
      }
    })

    if (invalidRooms.length > 0) {
      return toast.error(`Cannot save! Room ${invalidRooms.join(', ')} has an invalid reading.`, {
        duration: 5000,
        style: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
      })
    }

    // ✅ 2. หาเฉพาะ "ห้องที่ตัวเลขเปลี่ยนไปจากเดิม" (ไม่เหมาเซฟมั่วซั่วแล้ว)
    const roomsToUpdate = occupiedRooms.filter(room => {
      const data = meterData[room.id]
      if (!data || data.electricity.current === "" || data.water.current === "") return false

      // เอาค่าที่อยู่ในช่องกรอก ไปเทียบกับค่าที่โหลดมาจาก Database
      const savedElec = room.recordedData?.electricity?.toString() || ""
      const savedWater = room.recordedData?.water?.toString() || ""

      const isElecChanged = data.electricity.current !== savedElec
      const isWaterChanged = data.water.current !== savedWater

      // ส่งเซฟเฉพาะ "ห้องที่ยังไม่เคยเซฟ" หรือ "ห้องที่แอดมินเพิ่งแก้ตัวเลขใหม่" เท่านั้น!
      return (!room.isSaved) || isElecChanged || isWaterChanged
    })

    if (roomsToUpdate.length === 0) {
      return toast.info("No changes detected. Everything is up to date.")
    }

    setSubmitting(true)  
    try {
      toast.loading(`Processing ${roomsToUpdate.length} room(s)...`, { id: 'save-toast' })
      
      // ✅ 3. ใช้ For...of Loop ยิง API ทีละห้อง (ป้องกัน Server 500 Error จากการยิงพร้อมกัน)
      for (const room of roomsToUpdate) {
        const data = meterData[room.id]

        // 3.1 บันทึกมิเตอร์
        await api.meters.bulkCreate({
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

        // 3.2 สั่งสร้าง Invoice อัตโนมัติต่อทันที
        try {
          await api.invoices.generate({
            roomId: room.id,
            month: selectedMonth,
            monthDisplay: selectedMonth,
          })
        } catch (err: any) {
          // ถ้า Invoice เดือนนี้เคยสร้างไปแล้ว Backend จะเตะกลับมา เราก็แค่ข้ามไป ไม่ให้หน้าเว็บพัง
          console.warn(`Invoice generation skipped for Room ${room.number}:`, err?.message || err);
        }
      }

      toast.success(`Successfully saved meters and generated invoices for ${roomsToUpdate.length} room(s)!`, { id: 'save-toast' })
      loadData() 
    } catch (error) {
      toast.error('An error occurred during the save process.', { id: 'save-toast' })
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const uniqueFloors = [...new Set(occupiedRooms.map(r => r.floor))].sort((a, b) => a - b)
  const filteredRooms = occupiedRooms.filter(r => {
    const matchesSearch = r.number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFloor = selectedFloor === "all" || r.floor.toString() === selectedFloor
    return matchesSearch && matchesFloor
  })

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="relative space-y-8 pb-32"> 
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meter Entry</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">
                {occupiedRooms.filter(r => r.isSaved).length} Saved
             </span>
             <span className="flex items-center gap-1 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">
                {occupiedRooms.filter(r => !r.isSaved).length} To Do
             </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search Room..." className="pl-9 w-40 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           </div>
           <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-40 font-bold rounded-xl" />
        </div>
      </div>

      {/* Floor Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        <button onClick={() => setSelectedFloor("all")} className={cn("px-5 py-1.5 text-xs font-bold rounded-xl transition-all", selectedFloor === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}>All</button>
        {uniqueFloors.map(f => (
          <button key={f} onClick={() => setSelectedFloor(f.toString())} className={cn("px-5 py-1.5 text-xs font-bold rounded-xl transition-all", selectedFloor === f.toString() ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}>Floor {f}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRooms.map(room => {
            const data = meterData[room.id]
            if (!data) return null
            const isSaved = room.isSaved 

            const eCalc = calculateUsage(data.electricity.previous, data.electricity.current)
            const wCalc = calculateUsage(data.water.previous, data.water.current)
            
            const totalCost = (eCalc.valid ? eCalc.usage * parseFloat(elecRate) : 0) + 
                            (wCalc.valid ? wCalc.usage * parseFloat(waterRate) : 0)

            return (
              <Card key={room.id} className={cn(
                  "overflow-hidden border-2 transition-all duration-300",
                  !eCalc.valid || !wCalc.valid ? "border-red-300 bg-red-50/10" : 
                  isSaved ? "border-emerald-500 bg-emerald-50/10" : "border-slate-100 bg-white"
                )}>
                <div className={cn("flex items-center justify-between px-5 py-3 border-b", 
                   !eCalc.valid || !wCalc.valid ? "bg-red-50" : 
                   isSaved ? "bg-emerald-500/10" : "bg-slate-50/50"
                )}>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-800">Room {room.number}</h3>
                    {(!eCalc.valid || !wCalc.valid) ? (
                      <div className="flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
                        <AlertCircle className="h-3 w-3" /> Error Value
                      </div>
                    ) : isSaved ? (
                      <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
                        <CheckCircle className="h-3 w-3" /> Saved - Edit Mode
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-amber-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
                        <AlertCircle className="h-3 w-3" /> New Entry
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-black">Total Cost</p>
                    <p className={cn("font-black text-sm", 
                      !eCalc.valid || !wCalc.valid ? "text-red-600" : isSaved ? "text-emerald-700" : "text-blue-600"
                    )}>
                      {!eCalc.valid || !wCalc.valid ? "Invalid Reading" : `${totalCost.toLocaleString()} ฿`}
                    </p>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Electricity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-600"><Zap className="h-4 w-4 fill-amber-500" /><span className="font-black text-[10px] uppercase tracking-tighter">Electricity (kWh)</span></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-[9px] font-bold text-slate-400 uppercase">Prev</Label><div className="h-10 px-3 bg-slate-100 rounded-xl flex items-center text-sm font-bold text-slate-600 border border-slate-200">{data.electricity.previous}</div></div>
                      <div>
                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Current</Label>
                        <Input 
                          type="number" 
                          value={data.electricity.current} 
                          onChange={e => updateMeter(room.id, 'electricity', e.target.value)} 
                          className={cn("h-10 rounded-xl font-black", 
                            !eCalc.valid ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : 
                            isSaved ? "border-emerald-200 focus-visible:ring-emerald-500" : "focus-visible:ring-amber-500")} 
                        />
                      </div>
                    </div>
                  </div>
                  {/* Water */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8">
                    <div className="flex items-center gap-2 text-blue-600"><Droplets className="h-4 w-4 fill-blue-500" /><span className="font-black text-[10px] uppercase tracking-tighter">Water (Units)</span></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-[9px] font-bold text-slate-400 uppercase">Prev</Label><div className="h-10 px-3 bg-slate-100 rounded-xl flex items-center text-sm font-bold text-slate-600 border border-slate-200">{data.water.previous}</div></div>
                      <div>
                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Current</Label>
                        <Input 
                          type="number" 
                          value={data.water.current} 
                          onChange={e => updateMeter(room.id, 'water', e.target.value)} 
                          className={cn("h-10 rounded-xl font-black", 
                            !wCalc.valid ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : 
                            isSaved ? "border-emerald-200 focus-visible:ring-emerald-500" : "focus-visible:ring-blue-500")} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button type="submit" disabled={submitting} className="h-16 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all active:scale-95 group">
            {submitting ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <CheckCircle className="mr-3 h-5 w-5 text-emerald-400" />}
            <div className="flex flex-col items-start leading-tight">
              <span className="text-lg">Finalize Update</span>
              <span className="text-[10px] opacity-50 font-normal uppercase">{selectedMonth} cycle</span>
            </div>
          </Button>
        </div>
      </form>
    </div>
  )
}