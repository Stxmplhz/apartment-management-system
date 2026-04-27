import { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Trash2, DoorOpen, Phone, User } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Portal } from "@/components/ui/portal"

export function RoomDetailDrawer({ room, onClose, onUpdatePrice, onDelete }: any) {
  const [editPrice, setEditPrice] = useState(room.pricePerMonth)
  useEffect(() => { setEditPrice(room.pricePerMonth) }, [room])

  const handleDelete = async () => {
    const success = await onDelete(room)
    if (success) onClose()
  }

  const statusStyle: Record<string, string> = {
    OCCUPIED:    "bg-blue-50   text-blue-600   border-blue-100",
    VACANT:      "bg-emerald-50 text-emerald-600 border-emerald-100",
    MAINTENANCE: "bg-amber-50  text-amber-600  border-amber-100",
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-card border-l border-border shadow-2xl z-[61] flex flex-col animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Room {room.number}</h2>
            <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", statusStyle[room.status] ?? statusStyle.VACANT)}>
              {room.status}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Occupant */}
          <div className="bg-secondary border border-border rounded-xl p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Current Occupant</p>
            {room.status === 'OCCUPIED' && room.currentTenant ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{room.currentTenant.firstName} {room.currentTenant.lastName}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Phone className="h-2.5 w-2.5" /> {room.currentTenant.phone}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DoorOpen className="h-4 w-4" />
                {room.status === 'MAINTENANCE' ? 'Under Maintenance' : 'Room is currently vacant'}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Monthly Rent</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">฿</span>
                <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                  className="h-9 rounded-lg pl-7 bg-secondary border-border text-sm font-medium" />
              </div>
              <Button onClick={() => onUpdatePrice(room.id, parseFloat(editPrice))} size="sm"
                className="h-9 rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4">
                Apply
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Current: {formatCurrency(room.pricePerMonth)}/mo</p>
          </div>
        </div>

        {/* Delete */}
        <div className="p-5 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={handleDelete}
            className="w-full h-9 rounded-lg text-red-500 border-red-200 hover:bg-red-50 text-sm font-medium">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Unit
          </Button>
        </div>
      </div>
    </Portal>
  )
}
