import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, User, Clock, Wrench, ExternalLink } from "lucide-react"
import { cn, formatDateEng, getImageUrl } from "@/lib/utils"

export function MaintenanceCard({ request, roles, onUpdateStatus, onAssign }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-100 text-amber-600 border-amber-200'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-600 border-purple-200'
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-600 border-emerald-200'
      case 'CLOSED': return 'bg-slate-100 text-slate-500 border-slate-200'
      case 'REJECTED': return 'bg-red-100 text-red-600 border-red-200'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <Card className="rounded-[2rem] border-none shadow-md bg-white overflow-hidden hover:shadow-xl transition-all group">
      <div className="flex flex-col lg:flex-row">
        
        {/* Image Preview */}
        <div className="lg:w-64 h-48 lg:h-auto overflow-hidden relative">
          {request.imageUrl ? (
            <a href={getImageUrl(request.imageUrl)} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group cursor-zoom-in">
              <img src={getImageUrl(request.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Issue" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <ExternalLink className="text-white h-6 w-6" />
              </div>
            </a>
          ) : (
            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
              <Wrench className="h-8 w-8 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest">No Photo</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-slate-800 leading-tight">{request.description}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-400">
                <span className="flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg"><Home className="h-3 w-3" /> Room {request.room?.number}</span>
                <span className="flex items-center gap-1 text-xs font-bold"><User className="h-3 w-3" /> {request.tenant?.firstName}</span>
                <span className="flex items-center gap-1 text-xs font-bold"><Clock className="h-3 w-3" /> {formatDateEng(request.createdAt)}</span>
              </div>
            </div>
            <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm", getStatusColor(request.status))}>{request.status}</span>
          </div>

          {/* Workflow Actions */}
          <div className="pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-2">
                {roles.userIsAdmin && request.status === 'OPEN' && (
                  <Button size="sm" className="bg-blue-600 rounded-lg font-bold" onClick={() => onAssign(request.id)}>Assign Technician</Button>
                )}
                {(roles.userIsAdmin || roles.userIsTechnician) && request.status === 'ASSIGNED' && (
                  <Button size="sm" className="bg-emerald-500 text-white rounded-lg font-bold" onClick={() => onUpdateStatus(request.id, 'IN_PROGRESS')}>Start Repair</Button>
                )}
                {(roles.userIsAdmin || roles.userIsTechnician) && request.status === 'IN_PROGRESS' && (
                  <Button size="sm" className="bg-emerald-600 text-white rounded-lg font-bold" onClick={() => onUpdateStatus(request.id, 'RESOLVED')}>Mark Resolved</Button>
                )}
                {roles.userIsAdmin && request.status === 'RESOLVED' && (
                  <Button size="sm" className="bg-slate-900 text-white rounded-lg font-bold" onClick={() => onUpdateStatus(request.id, 'CLOSED')}>Close Job</Button>
                )}
            </div>
          </div>

          {request.technician && (
            <div className="text-xs font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-xl border border-blue-100">
              Technician: {request.technician.user?.email}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}