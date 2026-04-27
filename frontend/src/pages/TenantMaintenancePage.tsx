import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { MaintenanceCard } from "@/components/features/maintenance/MaintenanceCard"
import { MaintenanceFilterBar } from "@/components/features/maintenance/MaintenanceFilterBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Wrench, Loader2, Search, ImageIcon, Plus } from "lucide-react"
import { toast } from "sonner"
import type { MaintenanceRequest } from "@/lib/types"

export default function TenantMaintenancePage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [floorFilter, setFloorFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const tenantId = user?.profile?.id

  const loadRequests = async () => {
    if (!tenantId) { setLoading(false); return }
    try {
      setLoading(true)
      const data = await api.maintenance.list({ tenantId })
      setRequests(data)
    } catch { toast.error('Failed to load requests') } finally { setLoading(false) }
  }

  useEffect(() => { loadRequests() }, [tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return toast.error("Please describe the issue")
    try {
      setSubmitting(true)
      await api.maintenance.create({ tenantId: tenantId || '', description: description.trim(), imageUrl: imagePreview || undefined })
      toast.success("Request sent!")
      setDescription(""); setImagePreview(null); setShowForm(false)
      loadRequests()
    } catch { toast.error("Submit failed") } finally { setSubmitting(false) }
  }

  const processedRequests = useMemo(() => {
    return requests
      .filter(r => {
        const matchSearch = r.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchStatus = statusFilter === 'all' || r.status === statusFilter
        const matchFloor = floorFilter === 'all' || r.room?.floor?.toString() === floorFilter
        return matchSearch && matchStatus && matchFloor
      })
      .sort((a, b) => sortBy === 'newest'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
  }, [requests, searchQuery, statusFilter, floorFilter, sortBy])

  const uniqueFloors = useMemo(() => [...new Set(requests.map(r => r.room?.floor))].filter(Boolean).sort(), [requests])
  const filters = { searchQuery, setSearchQuery, statusFilter, setStatusFilter, floorFilter, setFloorFilter, sortBy, setSortBy }
  const roles = { userIsAdmin: false, userIsTechnician: false, userIsTenant: true }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>My Maintenance Requests</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track your repair requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search issue..." className="pl-9 w-52 h-9 rounded-lg bg-secondary border-border text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Request
          </Button>
        </div>
      </div>

      <MaintenanceFilterBar filters={filters} uniqueFloors={uniqueFloors} />

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm animate-in slide-in-from-top-2">
          <h2 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>What needs fixing?</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea placeholder="Explain the problem (e.g. Toilet leak, AC not cold...)" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-28 rounded-lg border-border bg-secondary text-sm resize-none" />
            <div className="flex flex-wrap gap-3 items-center">
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-9" onClick={() => document.getElementById('img-upload')?.click()}>
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Add Photo
              </Button>
              <Input id="img-upload" type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) { const r = new FileReader(); r.onloadend = () => setImagePreview(r.result as string); r.readAsDataURL(file) }
              }} className="hidden" />
              {imagePreview && <span className="text-xs text-blue-500 font-medium bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">Photo selected ✓</span>}
              <div className="flex-1" />
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-9" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9 px-6">
                {submitting ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "Send Request"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {processedRequests.map(request => (
          <MaintenanceCard key={request.id} request={request} roles={roles} onUpdateStatus={() => {}} onAssign={() => {}} />
        ))}
      </div>

      {processedRequests.length === 0 && (
        <div className="text-center py-20 bg-secondary/50 border-2 border-dashed border-border rounded-2xl">
          <Wrench className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No maintenance requests yet</p>
        </div>
      )}
    </div>
  )
}
