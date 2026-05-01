import { useState } from "react"
import { useAuth } from '@/contexts/AuthContext'
import { api } from "@/lib/api"
import { useMaintenance } from "@/hooks/useMaintenance"
import { MaintenanceCard } from "@/components/features/maintenance/MaintenanceCard"
import { MaintenanceFilterBar } from "@/components/features/maintenance/MaintenanceFilterBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea'
import { Wrench, Loader2, X, Search, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Portal } from '@/components/ui/portal'

export default function MaintenancePage() {
  const { user } = useAuth()
  const { processedRequests, loading, technicians, uniqueFloors, roles, filters, actions } = useMaintenance()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [description, setDescription] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const confirmAssign = async (techId: string) => {
    if (!selectedRequestId) return
    try {
      await api.maintenance.assign(selectedRequestId, techId)
      toast.success('Technician assigned!')
      setIsAssignModalOpen(false)
      actions.loadRequests()
    } catch { toast.error('Assign failed') }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return toast.error('Please describe the issue')
    try {
      setSubmitting(true)
      await api.maintenance.create({ tenantId: user?.id || '', description: description.trim(), imageUrl: imagePreview || undefined })
      toast.success('Request sent!')
      setDescription(''); setImagePreview(null); setShowForm(false)
      actions.loadRequests()
    } catch { toast.error('Submit failed') } finally { setSubmitting(false) }
  }

  if (loading && processedRequests.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex-1">
          <h1 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Maintenance Center</h1>
          <div className="flex items-center gap-3 mt-1">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
               <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {processedRequests.filter(r => r.status === 'OPEN').length} New Requests
             </div>
             <div className="h-1 w-1 rounded-full bg-border" />
             <div className="text-xs text-muted-foreground">{processedRequests.length} Tasks Total</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Room # or Issue..." 
              className="pl-9 h-10 rounded-xl bg-secondary border-border text-sm focus:ring-2 focus:ring-blue-500/20" 
              value={filters.searchQuery} 
              onChange={(e) => filters.setSearchQuery(e.target.value)} 
            />
          </div>
          {roles.userIsTenant && (
            <Button 
              onClick={() => setShowForm(!showForm)} 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-10 px-4 w-full sm:w-auto shadow-lg shadow-blue-500/20"
            >
              <Wrench className="h-3.5 w-3.5 mr-1.5" /> New Request
            </Button>
          )}
        </div>
      </div>

      <MaintenanceFilterBar filters={filters} uniqueFloors={uniqueFloors} />

      {/* Tenant Request Form */}
      {roles.userIsTenant && showForm && (
        <div className="bg-card border border-blue-200 rounded-xl p-6 shadow-sm animate-in slide-in-from-top-2">
          <h2 className="text-sm font-medium text-foreground mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>What needs fixing?</h2>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <Textarea
              placeholder="Explain the problem (e.g. Toilet leak, AC not cold...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 rounded-lg border-border bg-secondary text-sm resize-none"
            />
            <div className="flex flex-wrap gap-3 items-center">
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-9" onClick={() => document.getElementById('image-upload')?.click()}>
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Add Photo
              </Button>
              <Input id="image-upload" type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) { const r = new FileReader(); r.onloadend = () => setImagePreview(r.result as string); r.readAsDataURL(file) }
              }} className="hidden" />
              {imagePreview && <span className="text-xs text-blue-500 font-medium bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">Photo selected ✓</span>}
              <div className="flex-1" />
              <Button type="submit" disabled={submitting} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9 px-6">
                {submitting ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : 'Send Request'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {processedRequests.map(request => (
          <MaintenanceCard key={request.id} request={request} roles={roles} onUpdateStatus={actions.handleUpdateStatus} onAssign={(id: string) => { setSelectedRequestId(id); setIsAssignModalOpen(true) }} />
        ))}
      </div>

      {processedRequests.length === 0 && (
        <div className="text-center py-20 bg-secondary/50 border-2 border-dashed border-border rounded-2xl">
          <Wrench className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No maintenance requests found</p>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <Portal>
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Assign Technician</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Select a service provider</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsAssignModalOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {technicians.map(tech => (
                <div key={tech.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer group" onClick={() => confirmAssign(tech.id)}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-card rounded-lg flex items-center justify-center border border-border group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors">
                      <Wrench className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tech.user?.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{tech.expertise || 'All Services'}</p>
                    </div>
                  </div>
                  <Button size="sm" className="h-7 text-xs rounded-md bg-foreground text-background group-hover:bg-blue-500">Assign</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  )
}
