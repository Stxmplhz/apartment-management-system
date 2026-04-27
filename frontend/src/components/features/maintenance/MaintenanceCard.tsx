import { Button } from "@/components/ui/button"
import { Home, User, Clock, Wrench, ExternalLink } from "lucide-react"
import { cn, formatDateEng, getImageUrl } from "@/lib/utils"

const statusStyle: Record<string, string> = {
  OPEN:        "bg-amber-50  text-amber-600  border-amber-100",
  ASSIGNED:    "bg-blue-50   text-blue-600   border-blue-100",
  IN_PROGRESS: "bg-purple-50 text-purple-600 border-purple-100",
  RESOLVED:    "bg-emerald-50 text-emerald-600 border-emerald-100",
  CLOSED:      "bg-secondary  text-muted-foreground border-border",
  REJECTED:    "bg-red-50    text-red-600    border-red-100",
}
const statusLabel: Record<string, string> = {
  OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved', CLOSED: 'Closed', REJECTED: 'Rejected'
}
const topBar: Record<string, string> = {
  OPEN: "bg-amber-400", ASSIGNED: "bg-blue-500", IN_PROGRESS: "bg-purple-500",
  RESOLVED: "bg-emerald-500", CLOSED: "bg-border", REJECTED: "bg-red-500",
}

export function MaintenanceCard({ request, roles, onUpdateStatus, onAssign }: any) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
      {/* Top color bar */}
      <div className={cn("h-1", topBar[request.status] ?? "bg-border")} />

      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-48 h-40 sm:h-auto overflow-hidden relative flex-shrink-0 bg-secondary">
          {request.imageUrl ? (
            <a href={getImageUrl(request.imageUrl)} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-zoom-in">
              <img src={getImageUrl(request.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Issue" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-card/90 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <ExternalLink className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-foreground">View</span>
                </div>
              </div>
            </a>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
              <Wrench className="h-8 w-8 mb-1.5" />
              <span className="text-[10px] font-medium uppercase tracking-wide">No Photo</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">{request.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                  <Home className="h-3 w-3" /> Room {request.room?.number}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <User className="h-3 w-3" /> {request.tenant?.firstName}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {formatDateEng(request.createdAt)}
                </span>
              </div>
            </div>
            <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0", statusStyle[request.status] ?? statusStyle.CLOSED)}>
              {statusLabel[request.status] ?? request.status}
            </span>
          </div>

          {/* Technician badge */}
          {request.technician && (
            <div className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 w-fit px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <Wrench className="h-3 w-3" /> {request.technician.user?.email}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-auto pt-1">
            {roles.userIsAdmin && request.status === 'OPEN' && (
              <Button size="sm" onClick={() => onAssign(request.id)}
                className="h-8 text-xs rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                Assign Technician
              </Button>
            )}
            {(roles.userIsAdmin || roles.userIsTechnician) && request.status === 'ASSIGNED' && (
              <Button size="sm" onClick={() => onUpdateStatus(request.id, 'IN_PROGRESS')}
                className="h-8 text-xs rounded-lg bg-purple-500 hover:bg-purple-600 text-white">
                Start Repair
              </Button>
            )}
            {(roles.userIsAdmin || roles.userIsTechnician) && request.status === 'IN_PROGRESS' && (
              <Button size="sm" onClick={() => onUpdateStatus(request.id, 'RESOLVED')}
                className="h-8 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                Mark Resolved
              </Button>
            )}
            {roles.userIsAdmin && request.status === 'RESOLVED' && (
              <Button size="sm" onClick={() => onUpdateStatus(request.id, 'CLOSED')}
                className="h-8 text-xs rounded-lg bg-foreground hover:bg-foreground/90 text-background">
                Close Job
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
