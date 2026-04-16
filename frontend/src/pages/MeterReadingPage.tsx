// @ts-nocheck
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Zap, Droplets, Loader2 } from "lucide-react"
import type { Room, MeterReading } from "@/lib/types"
import { toast } from "sonner"
import { cn, formatCurrency } from "@/lib/utils"
const ELECTRICITY_RATE = 4.5
const WATER_RATE = 18

interface MeterData {
  electricity: { previous: number; current: string }
  water: { previous: number; current: string }
}

export default function MeterReadingPage() {
  const [occupiedRooms, setOccupiedRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [meterData, setMeterData] = useState<Record<string, MeterData>>({})

  const currentMonth = new Date().toISOString().slice(0, 7) // "2024-03"

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
  try {
    setLoading(true)
    const roomsData = await api.meters.pending(currentMonth)
    setOccupiedRooms(roomsData)
    
    const initial: Record<string, MeterData> = {}
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
    toast.error('Failed to sync data with database')
  } finally {
    setLoading(false)
  }
}

  const updateMeter = (roomId: string, type: 'electricity' | 'water', value: string) => {
    setMeterData(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [type]: { ...prev[roomId][type], current: value },
      },
    }))
  }

  const calculateUsage = (previous: number, current: string) => {
    const curr = parseFloat(current)
    if (isNaN(curr) || curr < previous) return { usage: 0, valid: false }
    return { usage: curr - previous, valid: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)  
    try {
      const promises = occupiedRooms.map(room => {
        const data = meterData[room.id]
        if (!data || !data.electricity.current || !data.water.current) return null

        return api.meters.bulkCreate({
          roomId: room.id,
          month: currentMonth,
          electricity: {
            previousValue: data.electricity.previous,
            currentValue: parseFloat(data.electricity.current),
            rateAtTime: ELECTRICITY_RATE
          },
          water: {
            previousValue: data.water.previous,
            currentValue: parseFloat(data.water.current),
            rateAtTime: WATER_RATE
          }
        })
      })

      await Promise.all(promises.filter(Boolean))
      toast.success('All readings saved successfully!')
      setSubmitted(true)
      toast.success('Meter readings saved!')
        
      setTimeout(() => {
        setSubmitted(false)
        loadData()
      }, 3000)
    } catch (error) {
      console.error('Failed to save readings:', error)
      toast.error('Failed to save meter readings')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

   if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Readings Saved</h2>
          <p className="text-sm text-muted-foreground">All meter readings have been recorded</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meter Entry</h1>
          <p className="text-muted-foreground mt-1">Record monthly electricity and water readings</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">{ELECTRICITY_RATE} THB/kWh</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">{WATER_RATE} THB/unit</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {occupiedRooms.map(room => {
          const data = meterData[room.id]
          if (!data) return null
          const isSaved = data?.electricity.isSaved && data?.water.isSaved
          
          const elecCalc = calculateUsage(data.electricity.previous, data.electricity.current)
          const waterCalc = calculateUsage(data.water.previous, data.water.current)
          const totalCost = (elecCalc.valid ? elecCalc.usage * ELECTRICITY_RATE : 0) + (waterCalc.valid ? waterCalc.usage * WATER_RATE : 0)

          return (
            <div key={room.id} className={cn(
              "bg-card border rounded-xl overflow-hidden transition-all",
              isSaved ? "opacity-75 border-emerald-500/30 bg-emerald-500/5" : "border-border"
            )}>
              {/* Room Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">Room {room.number}</h3>
                  {isSaved && (
                    <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">
                      <CheckCircle className="h-3 w-3" /> Recorded
                    </span>
                  )}
                </div>
                {(elecCalc.valid || waterCalc.valid) && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Estimated</p>
                    <p className="font-semibold">{totalCost.toFixed(0)} THB</p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Electricity */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <span className="font-medium text-sm">Electricity</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Previous</Label>
                        <div className="h-10 px-3 bg-secondary/50 border border-border rounded-lg flex items-center text-sm">
                          {data.electricity.previous} <span className="text-muted-foreground ml-1">kWh</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Current</Label>
                        <Input
                          type="number"
                          value={data.electricity.current}
                          disabled={isSaved} 
                          onChange={e => updateMeter(room.id, 'electricity', e.target.value)}
                          className={isSaved ? "bg-secondary/50 border-none" : ""}
                        />
                      </div>
                    </div>
                    {data.electricity.current && elecCalc.valid && (
                      <div className="flex items-center justify-between bg-amber-500/10 rounded-lg px-3 py-2 text-sm">
                        <span className="text-amber-600 dark:text-amber-400">Usage: {elecCalc.usage} kWh</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">{(elecCalc.usage * ELECTRICITY_RATE).toFixed(0)} THB</span>
                      </div>
                    )}
                  </div>

                  {/* Water */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Droplets className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <span className="font-medium text-sm">Water</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Previous</Label>
                        <div className="h-10 px-3 bg-secondary/50 border border-border rounded-lg flex items-center text-sm">
                          {data.water.previous} <span className="text-muted-foreground ml-1">units</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Current</Label>
                        <Input
                          type="number"
                          placeholder="units"
                          value={data.water.current}
                          disabled={isSaved}
                          onChange={e => updateMeter(room.id, 'water', e.target.value)}
                          className="h-10 rounded-lg"
                        />
                      </div>
                    </div>
                    {data.water.current && waterCalc.valid && (
                      <div className="flex items-center justify-between bg-blue-500/10 rounded-lg px-3 py-2 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">Usage: {waterCalc.usage} units</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{(waterCalc.usage * WATER_RATE).toFixed(0)} THB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <div className="flex justify-end pt-2">
          <Button type="submit" className="h-10 px-6 rounded-lg" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Save All Readings
          </Button>
        </div>
      </form>
    </div>
  )
}

/*
- Previous: This is the meter reading shown on the last day of the previous month (the start of this month).
- Current: This is the reading recorded by the administrator at the room on this day. 
- Usage: This is the difference in usage for the entire month, calculated as: Usage = Current - Previous
- Estimated (Total): This is the sum of the units used and the "price per unit" set by the building: Estimated Cost = Usage x Rate (Price per unit)
*/