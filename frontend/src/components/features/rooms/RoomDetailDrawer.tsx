import { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Trash2, DoorOpen } from "lucide-react"

export function RoomDetailDrawer({ room, onClose, onUpdatePrice, onDelete }: any) {
  const [editPrice, setEditPrice] = useState(room.pricePerMonth)

  // Update local state when room prop changes
  useEffect(() => { setEditPrice(room.pricePerMonth) }, [room])

  const handleApply = () => {
    onUpdatePrice(room.id, parseFloat(editPrice))
  }

  const handleDelete = async () => {
    const success = await onDelete(room)
    if (success) onClose()
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l shadow-2xl z-50 animate-in slide-in-from-right duration-300">
      <div className="p-10 space-y-10 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-slate-900">Room {room.number}</h2>
            <span className="text-blue-600 font-black text-xs uppercase tracking-widest">Level {room.floor}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-slate-100" onClick={onClose}><X className="h-6 w-6" /></Button>
        </div>

        <div className="space-y-8 flex-1">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Occupant</Label>
            {room.status === 'OCCUPIED' && room.currentTenant ? (
              <div className="space-y-2">
                <p className="font-bold text-xl text-slate-800">
                  {room.currentTenant.firstName} {room.currentTenant.lastName}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="bg-white px-2 py-1 rounded-md border text-slate-600">📞 {room.currentTenant.phone}</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-sm text-slate-400 italic flex items-center gap-2">
                <DoorOpen className="h-4 w-4 text-slate-300" />
                {room.status === 'MAINTENANCE' ? 'Under Maintenance' : 'Room is currently vacant'}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Market Pricing (Monthly)</Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input 
                  type="number" 
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="h-14 rounded-2xl pl-10 font-black text-xl bg-slate-50 border-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
              </div>
              <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 px-6 font-bold">Apply</Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
          <Button variant="destructive" onClick={handleDelete} className="w-full h-16 rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-lg shadow-red-50">
            <Trash2 className="h-5 w-5" /> Permanent Delete Unit
          </Button>
        </div>
      </div>
    </div>
  )
}