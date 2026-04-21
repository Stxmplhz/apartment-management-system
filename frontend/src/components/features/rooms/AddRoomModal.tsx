import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AddRoomModal({ onClose, onSuccess, existingRooms }: { onClose: () => void, onSuccess: () => void, existingRooms: any[] }) {
  const [newRoom, setNewRoom] = useState({ number: '', floor: '', price: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (existingRooms.some(r => r.number === newRoom.number)) {
      return toast.error(`Room ${newRoom.number} already exists!`)
    }
    
    setSubmitting(true)
    try {
      await api.rooms.create({
        number: newRoom.number,
        floor: parseInt(newRoom.floor),
        pricePerMonth: parseFloat(newRoom.price),
        status: 'VACANT'
      })
      toast.success("Room added!")
      onSuccess()
      onClose()
    } catch (error: any) { 
      toast.error(error.message || "Failed to add room.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <Card className="w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-200">
        <form onSubmit={handleAddRoom} className="p-10 space-y-8 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black">New Unit</h2>
            <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={onClose}><X/></Button>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold ml-1 text-slate-500 uppercase text-[10px]">Room Number</Label>
              <Input required placeholder="e.g. 101" value={newRoom.number} onChange={e => setNewRoom({...newRoom, number: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none text-lg font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold ml-1 text-slate-500 uppercase text-[10px]">Floor</Label>
                <Input required type="number" placeholder="1" value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold ml-1 text-slate-500 uppercase text-[10px]">Rent Price</Label>
                <Input required type="number" placeholder="5000" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none font-bold" />
              </div>
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-black rounded-2xl h-14 text-lg font-bold">
            {submitting ? <Loader2 className="animate-spin" /> : "Create Room"}
          </Button>
        </form>
      </Card>
    </div>
  )
}