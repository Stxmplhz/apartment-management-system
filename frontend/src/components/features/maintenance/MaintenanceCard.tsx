import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, User, Clock, Wrench, ExternalLink, X, ChevronRight } from "lucide-react"
import { cn, formatDateEng, getImageUrl } from "@/lib/utils"

const statusStyle: Record<string, string> = {
  OPEN:        "bg-amber-500/15  text-amber-500  border-amber-500/20",
  ASSIGNED:    "bg-blue-500/15   text-blue-500   border-blue-500/20",
  IN_PROGRESS: "bg-purple-500/15 text-purple-500 border-purple-500/20",
  RESOLVED:    "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  CLOSED:      "bg-secondary     text-muted-foreground border-border",
  REJECTED:    "bg-red-500/15    text-red-500    border-red-500/20",
}
const statusLabel: Record<string, string> = {
  OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved', CLOSED: 'Closed', REJECTED: 'Rejected'
}
const topBar: Record<string, string> = {
  OPEN: "bg-amber-400", ASSIGNED: "bg-blue-500", IN_PROGRESS: "bg-purple-500",
  RESOLVED: "bg-emerald-500", CLOSED: "bg-border", REJECTED: "bg-red-500",
}

function ActionButtons({ request, roles, onUpdateStatus, onAssign, onClose, size = "sm" }: any) {
  const isModal = !!onClose
  const btnClass = isModal ? "h-9 flex-1 text-xs rounded-lg" : "h-8 text-xs rounded-lg"

  return (
    <>
      {roles.userIsAdmin && request.status === 'OPEN' && (
        <Button size={size} onClick={() => { onAssign(request.id); onClose?.() }}
          className={`${btnClass} bg-blue-500 hover:bg-blue-600 text-white`}>
          Assign Technician
        </Button>
      )}
      {!roles.userIsTenant && request.status === 'ASSIGNED' && (
        <Button size={size} onClick={() => { onUpdateStatus(request.id, 'IN_PROGRESS'); onClose?.() }}
          className={`${btnClass} bg-purple-500 hover:bg-purple-600 text-white`}>
          Start Repair
        </Button>
      )}
      {!roles.userIsTenant && request.status === 'IN_PROGRESS' && (
        <Button size={size} onClick={() => { onUpdateStatus(request.id, 'RESOLVED'); onClose?.() }}
          className={`${btnClass} bg-emerald-500 hover:bg-emerald-600 text-white`}>
          Mark Resolved
        </Button>
      )}
      {roles.userIsAdmin && request.status === 'RESOLVED' && (
        <Button size={size} onClick={() => { onUpdateStatus(request.id, 'CLOSED'); onClose?.() }}
          className={`${btnClass} bg-foreground hover:bg-foreground/90 text-background`}>
          Close Job
        </Button>
      )}
    </>
  )
}

function DetailModal({ request, roles, onUpdateStatus, onAssign, onClose }: any) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]" onClick={onClose} />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", statusStyle[request.status] ?? statusStyle.CLOSED)}>
                {statusLabel[request.status] ?? request.status}
              </span>
              <span className="text-xs text-muted-foreground">#{request.id.slice(-6)}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-5 space-y-4">
            {request.imageUrl && (
              <div className="border border-border rounded-xl overflow-hidden bg-secondary group relative cursor-zoom-in"
                onClick={() => window.open(getImageUrl(request.imageUrl), '_blank')}>
                <img src={getImageUrl(request.imageUrl)} className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" alt="Issue" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <span className="bg-card/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" /> View full size
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Issue Description</p>
              <p className="text-sm font-medium text-foreground">{request.description}</p>
            </div>

            <div className="bg-secondary rounded-xl border border-border overflow-hidden">
              {[
                { icon: Home, label: "Room", value: `Room ${request.room?.number}` },
                { icon: User, label: "Reported by", value: `${request.tenant?.firstName} ${request.tenant?.lastName ?? ''}` },
                { icon: Clock, label: "Submitted", value: formatDateEng(request.createdAt) },
                ...(request.technician ? [{ icon: Wrench, label: "Assigned to", value: request.technician.user?.email }] : []),
              ].map(({ icon: Icon, label, value }, i, arr) => (
                <div key={label} className={cn("flex items-center gap-3 px-4 py-3", i < arr.length - 1 && "border-b border-border")}>
                  <div className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="rounded-lg h-9 flex-1" onClick={onClose}>Close</Button>
              <ActionButtons request={request} roles={roles} onUpdateStatus={onUpdateStatus} onAssign={onAssign} onClose={onClose} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function MaintenanceCard({ request, roles, onUpdateStatus, onAssign }: any) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer"
        onClick={() => setShowDetail(true)}>
        <div className={cn("h-1", topBar[request.status] ?? "bg-border")} />

        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 h-40 sm:h-auto overflow-hidden relative flex-shrink-0 bg-secondary">
            {request.imageUrl ? (
              <img src={getImageUrl(request.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Issue" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                <Wrench className="h-8 w-8 mb-1.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">No Photo</span>
              </div>
            )}
          </div>

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
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", statusStyle[request.status] ?? statusStyle.CLOSED)}>
                  {statusLabel[request.status] ?? request.status}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>

            {request.technician && (
              <div className="text-[11px] font-medium text-blue-500 bg-blue-500/10 border border-blue-500/20 w-fit px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <Wrench className="h-3 w-3" /> {request.technician.user?.email}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-auto pt-1" onClick={e => e.stopPropagation()}>
              <ActionButtons request={request} roles={roles} onUpdateStatus={onUpdateStatus} onAssign={onAssign} />
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <DetailModal
          request={request}
          roles={roles}
          onUpdateStatus={onUpdateStatus}
          onAssign={onAssign}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}
