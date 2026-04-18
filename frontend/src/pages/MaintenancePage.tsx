// @ts-nocheck
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Wrench, Loader2, Upload, X, Search, Calendar, 
  User, Home, Clock, CheckCircle2, AlertCircle, 
  ArrowUpDown, Filter, ChevronRight, Layers, ImageIcon, Maximize2
} from 'lucide-react'
import type { MaintenanceRequest } from '@/lib/types'
import { toast } from 'sonner'
import { cn, getImageUrl } from '@/lib/utils'

export default function MaintenancePage() {
  const { user } = useAuth()
  const userIsAdmin = user?.role === 'ADMIN'
  const userIsTechnician = user?.role === 'TECHNICIAN'
  const userIsTenant = user?.role === 'TENANT'

  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [floorFilter, setFloorFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest") 
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [description, setDescription] = useState('')  
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
    if (userIsAdmin) loadTechnicians()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await api.maintenance.list()
      setRequests(data)
    } catch (error) { toast.error('Failed to load requests') } finally { setLoading(false) }
  }

  const loadTechnicians = async () => {
    try {
      const data = await api.maintenance.listTechnicians()
      setTechnicians(data) 
    } catch (error) { console.error(error) }
  }

  const processedRequests = requests
    .filter(req => {
      const matchesSearch = req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.room?.number.includes(searchQuery)
      const matchesStatus = statusFilter === "all" || req.status === statusFilter
      const matchesFloor = floorFilter === "all" || req.room?.floor.toString() === floorFilter
      return matchesSearch && matchesStatus && matchesFloor
    })
    .sort((a, b) => {
      return sortBy === "newest" 
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  const uniqueFloors = [...new Set(requests.map(r => r.room?.floor))].filter(Boolean).sort()

  const handleUpdateStatus = async (requestId: string, nextStatus: string) => {
    try {
      setLoading(true);
      await api.maintenance.updateStatus(requestId, nextStatus);
      toast.success(`Status updated to ${nextStatus}`);
      await loadRequests();
    } catch (error) { toast.error('Update failed'); } finally { setLoading(false); }
  }

  const handleAssignTech = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsAssignModalOpen(true);
  };

  const confirmAssign = async (techId: string) => {
    if (!selectedRequestId) return;
    try {
      setLoading(true);
      await api.maintenance.assign(selectedRequestId, techId);
      toast.success('Technician assigned!');
      setIsAssignModalOpen(false); 
      await loadRequests(); 
    } catch (error) { toast.error('Assign failed'); } finally { setLoading(false); }
  };

  if (loading && requests.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {userIsTenant && (
            <Button onClick={() => setShowForm(!showForm)} className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold">
              <Wrench className="h-4 w-4 mr-2" /> New Request
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Sorters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
           {/* Status Tabs */}
           <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
            {['all', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                  statusFilter === s ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {s === 'all' ? 'All Jobs' : s}
              </button>
            ))}
          </div>

          {/* Floor Filter */}
          <select 
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="h-9 px-4 rounded-xl bg-slate-100 border-none text-[10px] font-black uppercase text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">All Floors</option>
            {uniqueFloors.map(f => <option key={f} value={f.toString()}>Floor {f}</option>)}
          </select>
        </div>

        {/* Sort Sorter */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
           <Button 
            variant={sortBy === 'newest' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="text-[10px] font-black rounded-lg h-7"
            onClick={() => setSortBy('newest')}
           >
             LATEST
           </Button>
           <Button 
            variant={sortBy === 'oldest' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="text-[10px] font-black rounded-lg h-7"
            onClick={() => setSortBy('oldest')}
           >
             OLDEST
           </Button>
        </div>
      </div>

      {/* Tenant Form */}
      {userIsTenant && showForm && (
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

      {/* Requests List */}
      <div className="grid gap-6">
        {processedRequests.map(request => (
          <Card key={request.id} className="rounded-[2rem] border-none shadow-md bg-white overflow-hidden hover:shadow-xl transition-all group">
            <div className="flex flex-col lg:flex-row">
              {/* Image Preview */}
              <div className="lg:w-64 h-48 lg:h-auto overflow-hidden relative cursor-pointer" onClick={() => request.imageUrl && setExpandedImage(getImageUrl(request.imageUrl))}>
                {request.imageUrl ? (
                  <>
                    <img src={getImageUrl(request.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Maximize2 className="text-white h-6 w-6" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                    <Wrench className="h-8 w-8 mb-2" />
                    <span className="text-[10px] font-bold uppercase">No Photo</span>
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
                      <span className="flex items-center gap-1 text-xs font-bold"><Clock className="h-3 w-3" /> {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", getStatusColor(request.status))}>{request.status}</span>
                </div>

                {/* Workflow Actions */}
                <div className="pt-2">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-2">
                      {userIsAdmin && request.status === 'OPEN' && (
                        <Button size="sm" className="bg-blue-600 rounded-lg font-bold" onClick={() => {setSelectedRequestId(request.id); setIsAssignModalOpen(true);}}>
                          Assign Technician
                        </Button>
                      )}
                      {(userIsAdmin || userIsTechnician) && request.status === 'ASSIGNED' && (
                        <Button size="sm" className="bg-emerald-500 text-white rounded-lg font-bold" onClick={() => handleUpdateStatus(request.id, 'IN_PROGRESS')}>Start Repair</Button>
                      )}
                      {(userIsAdmin || userIsTechnician) && request.status === 'IN_PROGRESS' && (
                        <Button size="sm" className="bg-emerald-600 text-white rounded-lg font-bold" onClick={() => handleUpdateStatus(request.id, 'RESOLVED')}>Mark Resolved</Button>
                      )}
                      {userIsAdmin && request.status === 'RESOLVED' && (
                        <Button size="sm" className="bg-slate-900 text-white rounded-lg font-bold" onClick={() => handleUpdateStatus(request.id, 'CLOSED')}>Close Job</Button>
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
        ))}
      </div>

      {/* Image Lightbox */}
      {expandedImage && (
        <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setExpandedImage(null)}>
           <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/10">
             <X className="h-8 w-8" />
           </Button>
           <img src={expandedImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95" />
        </div>
      )}

      {/* Empty State */}
      {processedRequests.length === 0 && (
        <div className="text-center py-32 bg-slate-50 border-2 border-dashed rounded-[3rem]">
          <Wrench className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="font-black text-slate-300 uppercase tracking-widest text-sm">No maintenance requests found</p>
        </div>
      )}

      {/* Assign Technician Modal (Styled like Details) */}
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

  function getStatusColor(status: string) {
    switch (status) {
      case 'OPEN': return 'bg-amber-500/10 text-amber-600 border-amber-200'
      case 'ASSIGNED': return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'IN_PROGRESS': return 'bg-purple-500/10 text-purple-600 border-purple-200'
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
      case 'CLOSED': return 'bg-slate-100 text-slate-500 border-slate-200'
      case 'REJECTED': return 'bg-red-500/10 text-red-600 border-red-200'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  async function handleSubmitRequest(e: React.FormEvent) {
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
      loadRequests()
    } catch (e) { toast.error('Submit failed') } finally { setSubmitting(false) }
  }
}

function DetailItem({ icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
        {React.cloneElement(icon, { className: "h-4 w-4" })}
      </div>
      <div className="overflow-hidden">
        <p className="text-[8px] uppercase font-black text-slate-400 tracking-tighter leading-none mb-1">{label}</p>
        <p className={cn("text-xs font-bold truncate", highlight ? "text-blue-600" : "text-slate-700")}>{value || "N/A"}</p>
      </div>
    </div>
  )
}

/*
1. 'OPEN' Status: Tenant has submitted a repair request -> The only button the Admin sees is "Assign Technician".
2. Press 'Assign Button': Enter Technician ID -> Status will automatically change to ASSIGNED (according to the Stamp backend logic).
3. 'ASSIGNED' Status: Once the technician accepts the job, the "Update Status" button will appear, changing to IN_PROGRESS.
4. Final Status: When the repair is complete, it changes to RESOLVED, and the Admin closes the job as CLOSED.
*/
