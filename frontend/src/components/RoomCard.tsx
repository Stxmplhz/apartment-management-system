import { cn } from "@/lib/utils"
import type { Room, RoomStatus } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { User } from "lucide-react"

const statusConfig: Record<RoomStatus, { label: string; bg: string; text: string; dot: string }> = {
  VACANT: { 
    label: "Available", 
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    dot: "bg-emerald-500"
  },
  OCCUPIED: { 
    label: "Occupied", 
    bg: "bg-blue-500/15",
    text: "text-blue-500",
    dot: "bg-blue-500"
  },
  MAINTENANCE: { 
    label: "Maintenance", 
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    dot: "bg-amber-500"
  },
}

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  const status = statusConfig[room.status] || statusConfig.VACANT;

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-foreground/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{room.number}</h3>
        <span className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full",
          status.bg, 
          status.text
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>
      
      <div className="mb-3">
        <span className="text-xl font-semibold">{formatCurrency(room.pricePerMonth)}</span>
        <span className="text-sm text-muted-foreground ml-1">/mo</span>
      </div>
      
      {room.tenant ? (
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-sm truncate">{room.tenant.name}</p>
        </div>
      ) : (
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground">No tenant</p>
        </div>
      )}
    </div>
  )
}