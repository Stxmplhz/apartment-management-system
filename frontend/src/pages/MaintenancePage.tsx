import { useState } from "react"
import { useAuth } from '@/contexts/AuthContext'
import { api } from "@/lib/api"
import { useMaintenance } from "@/hooks/useMaintenance"
import { MaintenanceCard } from "@/components/features/maintenance/MaintenanceCard"
import { MaintenanceFilterBar } from "@/components/features/maintenance/MaintenanceFilterBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Loader2, X, Search, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function MaintenancePage() {
  const { user } = useAuth()
  const { processedRequests, loading, technicians, uniqueFloors, roles, filters, actions } = useMaintenance()
  
  // UI States
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [description, setDescription] = useState('')  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const confirmAssign = async (techId: string) => {
    if (!selectedRequestId) return;
    try {
      await api.maintenance.assign(selectedRequestId, techId);
      toast.success('Technician assigned!');
      setIsAssignModalOpen(false); 
      actions.loadRequests(); 
    } catch (error) { toast.error('Assign failed'); }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return toast.error('Please describe the issue')
    try {
      setSubmitting(true)
      await api.maintenance.create({
        tenantId: user?.id || '',
        description: description.trim(),
        imageUrl: imagePreview || undefined,
      })
      toast.success('Request sent!')
      setDescription(''); setImagePreview(null); setShowForm(false)
      actions.loadRequests()
    } catch (e) { toast.error('Submit failed') } finally { setSubmitting(false) }
  }

  if (loading && processedRequests.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Maintenance</h1>
          <p className="text-muted-foreground text-sm">Track and manage repair requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search issue or room..." 
              className="pl-9 w-[220px] rounded-2xl bg-slate-50 border-none focus-visible:ring-blue-500"
              value={filters.searchQuery}
              onChange={(e) => filters.setSearchQuery(e.target.value)}
            />
          </div>
          {roles.userIsTenant && (
            <Button onClick={() => setShowForm(!showForm)} className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold">
              <Wrench className="h-4 w-4 mr-2" /> New Request
            </Button>
          )}
        </div>
      </div>

      <MaintenanceFilterBar filters={filters} uniqueFloors={uniqueFloors} />

      {/* Tenant Request Form */}
      {roles.userIsTenant && showForm && (
        <Card className="rounded-[2rem] border-none shadow-xl bg-blue-600 text-white overflow-hidden animate-in slide-in-from-top-4">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-black">What needs fixing?</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <Textarea
                placeholder="Explain the problem (e.g. Toilet leak, AC not cold...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-32 rounded-2xl focus-visible:ring-white"
              />
              <div className="flex flex-col md:flex-row gap-4 items-center">
                 <Button type="button" variant="outline" className="w-full md:w-auto bg-white/10 border-white/20 text-white hover:bg-white hover:text-blue-600 rounded-xl" onClick={() => document.getElementById('image')?.click()}>
                    <ImageIcon className="mr-2 h-4 w-4" /> Add Photo
                 </Button>
                 <Input id="image" type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => setImagePreview(reader.result as string)
                      reader.readAsDataURL(file)
                    }
                 }} className="hidden" />
                 {imagePreview && <p className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full italic">Photo selected!</p>}
                 <div className="flex-1" />
                 <Button type="submit" disabled={submitting} className="w-full md:w-auto bg-white text-blue-600 hover:bg-slate-100 font-black px-10 rounded-xl h-12">
                   {submitting ? <Loader2 className="animate-spin" /> : 'Send Request'}
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="grid gap-6">
        {processedRequests.map(request => (
          <MaintenanceCard 
            key={request.id} 
            request={request}
            roles={roles}
            onUpdateStatus={actions.handleUpdateStatus}
            onAssign={(id: string) => { setSelectedRequestId(id); setIsAssignModalOpen(true); }}
          />
        ))}
      </div>

      {processedRequests.length === 0 && (
        <div className="text-center py-32 bg-slate-50 border-2 border-dashed rounded-[3rem]">
          <Wrench className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="font-black text-slate-300 uppercase tracking-widest text-sm">No maintenance requests found</p>
        </div>
      )}

      {/* Assign Technician Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-none animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
               <div>
                  <h2 className="text-2xl font-black">Assign Expert</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select service provider</p>
               </div>
               <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsAssignModalOpen(false)}><X/></Button>
            </div>
            <CardContent className="p-8 space-y-4 max-h-[50vh] overflow-y-auto">
              {technicians.map(tech => (
                <div key={tech.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group" onClick={() => confirmAssign(tech.id)}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-700">{tech.user?.email}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{tech.expertise || 'All Services'}</p>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-lg bg-slate-900 group-hover:bg-blue-600">Assign</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}