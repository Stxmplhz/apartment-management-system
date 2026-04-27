import { cn, formatCurrency } from "@/lib/utils"
import type { Room, RoomStatus } from "@/lib/types"
import { User } from "lucide-react"

const statusConfig: Record<RoomStatus, { label: string; bg: string; text: string; dot: string; topBar: string }> = {
  VACANT:      { label: "Available",   bg: "bg-emerald-50",  text: "text-emerald-600", dot: "bg-emerald-500", topBar: "bg-emerald-500" },
  OCCUPIED:    { label: "Occupied",    bg: "bg-blue-50",     text: "text-blue-600",    dot: "bg-blue-500",    topBar: "bg-blue-500"    },
  MAINTENANCE: { label: "Maintenance", bg: "bg-amber-50",    text: "text-amber-600",   dot: "bg-amber-500",   topBar: "bg-amber-500"   },
}

export function RoomCard({ room }: { room: Room }) {
  const status = statusConfig[room.status] ?? statusConfig.VACANT
  const tenantName = room.currentTenant ? `${room.currentTenant.firstName} ${room.currentTenant.lastName}` : null

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
      room.status === 'OCCUPIED' && "border-blue-100",
      room.status === 'MAINTENANCE' && "border-amber-100",
    )}>
      {/* Top color bar */}
      <div className={cn("h-1", status.topBar)} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>{room.number}</h3>
          <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full", status.bg, status.text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        <div className="mb-3">
          <span className="text-base font-semibold text-foreground">{formatCurrency(room.pricePerMonth)}</span>
          <span className="text-xs text-muted-foreground ml-1">/mo</span>
        </div>

        <div className="pt-3 border-t border-border">
          {tenantName ? (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User className="h-3 w-3 text-blue-500" />
              </div>
              <p className="text-xs font-medium text-foreground truncate">{tenantName}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {room.status === 'MAINTENANCE' ? 'Under repair' : 'No occupant'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
