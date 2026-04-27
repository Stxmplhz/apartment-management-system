import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Portal } from "@/components/ui/portal"

export function AddRoomModal({ onClose, onSuccess, existingRooms }: { onClose: () => void, onSuccess: () => void, existingRooms: any[] }) {
  const [newRoom, setNewRoom] = useState({ number: '', floor: '', price: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (existingRooms.some(r => r.number === newRoom.number)) {
      return toast.error(`Room ${newRoom.number} already exists!`)
    }
    setSubmitting(true)
    try {
      await api.rooms.create({ number: newRoom.number, floor: parseInt(newRoom.floor), pricePerMonth: parseFloat(newRoom.price), status: 'VACANT' })
      toast.success("Room added!")
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to add room.")
    } finally { setSubmitting(false) }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[201] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-4">
      <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>New Unit</h2>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Room Number</Label>
              <Input required placeholder="e.g. 101" value={newRoom.number}
                onChange={e => setNewRoom({ ...newRoom, number: e.target.value })}
                className="h-9 rounded-lg bg-secondary border-border text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Floor</Label>
                <Input required type="number" placeholder="1" value={newRoom.floor}
                  onChange={e => setNewRoom({ ...newRoom, floor: e.target.value })}
                  className="h-9 rounded-lg bg-secondary border-border text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Rent Price (฿)</Label>
                <Input required type="number" placeholder="5000" value={newRoom.price}
                  onChange={e => setNewRoom({ ...newRoom, price: e.target.value })}
                  className="h-9 rounded-lg bg-secondary border-border text-sm" />
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-border flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" className="rounded-lg h-9" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting} size="sm" className="rounded-lg h-9 bg-blue-500 hover:bg-blue-600 text-white px-6">
              {submitting ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : null}
              Create Room
            </Button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  )
}
