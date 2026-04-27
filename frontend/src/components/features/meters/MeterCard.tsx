import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Zap, Droplets, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function MeterCard({ room, data, rates, onUpdate, calculateUsage }: any) {
  const eCalc = calculateUsage(data.electricity.previous, data.electricity.current)
  const wCalc = calculateUsage(data.water.previous, data.water.current)
  const isSaved = room.isSaved

  const totalCost = (eCalc.valid ? eCalc.usage * rates.elec : 0) + 
                    (wCalc.valid ? wCalc.usage * rates.water : 0)

  const hasError = !eCalc.valid || !wCalc.valid

  return (
    <Card className={cn(
      "overflow-hidden border-2 transition-all duration-300",
      hasError ? "border-red-300 bg-red-50/10" : 
      isSaved ? "border-emerald-500 bg-emerald-50/10" : "border-slate-100 bg-white"
    )}>
      <div className={cn("flex items-center justify-between px-5 py-3 border-b", 
         hasError ? "bg-red-50" : isSaved ? "bg-emerald-500/10" : "bg-slate-50/50"
      )}>
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-lg text-slate-800">Room {room.number}</h3>
          {hasError ? (
            <div className="flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
              <AlertCircle className="h-3 w-3" /> Error Value
            </div>
          ) : isSaved ? (
            <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
              <CheckCircle className="h-3 w-3" /> Saved
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
              <AlertCircle className="h-3 w-3" /> New Entry
            </div>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-[9px] text-slate-400 uppercase font-black">Total Cost</p>
          <p className={cn("font-black text-sm", hasError ? "text-red-600" : isSaved ? "text-emerald-700" : "text-blue-600")}>
            {hasError ? "Invalid Reading" : `${totalCost.toLocaleString()} ฿`}
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Electricity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600"><Zap className="h-4 w-4 fill-amber-500" /><span className="font-black text-[10px] uppercase tracking-tighter">Electricity (kWh)</span></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[9px] font-medium text-slate-400 uppercase">Prev</Label><div className="h-10 px-3 bg-slate-100 rounded-xl flex items-center text-sm font-medium text-slate-600 border border-slate-200">{data.electricity.previous}</div></div>
            <div>
              <Label className="text-[9px] font-medium text-slate-400 uppercase">Current</Label>
              <Input 
                type="number" 
                value={data.electricity.current} 
                onChange={e => onUpdate(room.id, 'electricity', e.target.value)} 
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
            <div><Label className="text-[9px] font-medium text-slate-400 uppercase">Prev</Label><div className="h-10 px-3 bg-slate-100 rounded-xl flex items-center text-sm font-medium text-slate-600 border border-slate-200">{data.water.previous}</div></div>
            <div>
              <Label className="text-[9px] font-medium text-slate-400 uppercase">Current</Label>
              <Input 
                type="number" 
                value={data.water.current} 
                onChange={e => onUpdate(room.id, 'water', e.target.value)} 
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
}