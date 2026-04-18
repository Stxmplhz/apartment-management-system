// @ts-nocheck
import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { 
  Search, FileText, Calendar, User, CreditCard, 
  X, ImageIcon, Info, Phone, Fingerprint,
  Clock, Hourglass, ShieldCheck, AlertCircle, 
  ExternalLink, Trash2, ShieldAlert
} from "lucide-react"
import { formatCurrency, formatDateEng, getImageUrl } from "@/lib/utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function LeaseManagementPage() {
  const [leases, setLeases] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") 
  const [floorFilter, setFloorFilter] = useState("all") 
  const [sortBy, setSortBy] = useState("newest") 
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLease, setSelectedLease] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false) 
  const [terminating, setTerminating] = useState(false)

  useEffect(() => { loadLeases() }, [])

  const loadLeases = async () => {
    try {
      const data = await api.leases.list()
      setLeases(data)
    } catch (e) { toast.error("Failed to load leases") }
  }

  const getLeaseAge = (startDate) => {
    const start = new Date(startDate)
    const now = new Date()
    if (start > now) return `Starting in ${Math.ceil((start - now) / 86400000)} days`
    let years = now.getFullYear() - start.getFullYear()
    let months = now.getMonth() - start.getMonth()
    let days = now.getDate() - start.getDate()
    if (days < 0) { months -= 1; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
    if (months < 0) { years -= 1; months += 12 }
    const parts = []
    if (years > 0) parts.push(`${years}y`)
    if (months > 0) parts.push(`${months}m`)
    if (days > 0 && years === 0) parts.push(`${days}d`)
    return parts.length > 0 ? parts.join(' ') : "Joined today"
  }

  const handleTerminate = async () => {
    if (!selectedLease) return
    try {
      setTerminating(true)
      await api.leases.terminate(selectedLease.id)
      toast.success("Agreement terminated successfully")
      setIsConfirmOpen(false)
      setIsModalOpen(false)
      loadLeases()
    } catch (e) { toast.error("Error in termination process") }
    finally { setTerminating(false) }
  }

  const processedLeases = leases
    .filter(l => {
      const matchesSearch = l.room.number.includes(search) || l.tenant.firstName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || l.status === statusFilter
      const matchesFloor = floorFilter === "all" || l.room.floor.toString() === floorFilter
      return matchesSearch && matchesStatus && matchesFloor
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      if (sortBy === "oldest") return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      if (sortBy === "expiring") {
        // ดึงตัวที่ใกล้หมดอายุ (มี endDate) ขึ้นก่อน, พวกที่ไม่มี (Infinity) ไว้หลังสุด
        const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity
        const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity
        return dateA - dateB
      }
      return a.room.number.localeCompare(b.room.number, undefined, {numeric: true})
    })

  const uniqueFloors = [...new Set(leases.map(l => l.room.floor))].sort()

  const openDetail = (lease) => { setSelectedLease(lease); setIsModalOpen(true); }

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Lease Management</h1>
          <p className="text-muted-foreground text-sm font-medium text-slate-400">Review active and past tenant contracts</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search..." className="pl-10 h-12 rounded-2xl bg-slate-50 border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Filters & Sorters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
           {/* Status Tabs */}
           <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
            {['all', 'ACTIVE', 'TERMINATED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                  statusFilter === status ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {status === 'all' ? 'All Contracts' : status}
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
           <select 
             value={sortBy} 
             onChange={(e) => setSortBy(e.target.value)} 
             className="h-7 px-3 rounded-lg bg-transparent border-none text-[10px] font-black uppercase text-slate-600 focus:ring-0 outline-none cursor-pointer"
           >
             <option value="newest">Latest Start</option>
             <option value="oldest">Oldest Start</option>
             <option value="expiring">Expiring Soon</option>
             <option value="room">By Room #</option>
           </select>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {processedLeases.map(lease => (
          <Card key={lease.id} className="p-5 hover:shadow-xl transition-all border-none shadow-md bg-white rounded-[2rem]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 text-white flex flex-col items-center justify-center font-black">
                   <span className="text-[10px] opacity-60 uppercase">Room</span>{lease.room.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-xl">{lease.tenant.firstName} {lease.tenant.lastName}</p>
                    <span className={cn("text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest", lease.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600')}>{lease.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs font-bold">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-blue-500" /> {getLeaseAge(lease.startDate)}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDateEng(lease.startDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => openDetail(lease)} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-black font-bold">View Contract</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- Detail Modal --- */}
      {isModalOpen && selectedLease && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl">{selectedLease.room.number}</div>
                <div><h2 className="text-2xl font-black">Contract Details</h2><p className="text-xs text-blue-600 font-bold uppercase tracking-widest">ID: {selectedLease.id.slice(-8)}</p></div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" onClick={() => setIsModalOpen(false)}><X className="h-6 w-6" /></Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid md:grid-cols-2 gap-10">
                
                {/* Left Column: Info */}
                <div className="space-y-8">
                  <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                    <Hourglass className="h-6 w-6 text-blue-600" />
                    <div><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Duration</p><p className="text-xl font-black text-blue-700">{getLeaseAge(selectedLease.startDate)}</p></div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Contractual Terms</h3>
                    <div className="grid gap-3">
                      <DetailItem icon={<Calendar />} label="Commencement" value={formatDateEng(selectedLease.startDate)} />
                      <DetailItem icon={<Calendar />} label="Expiriation" value={selectedLease.endDate ? formatDateEng(selectedLease.endDate) : "Indefinite"} />
                      <DetailItem icon={<CreditCard />} label="Base Monthly Rent" value={formatCurrency(selectedLease.agreedBaseRent)} highlight />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2"><User className="h-4 w-4" /> Tenant Information</h3>
                    <div className="grid gap-3">
                      <DetailItem icon={<User />} label="Name" value={`${selectedLease.tenant.firstName} ${selectedLease.tenant.lastName}`} />
                      <DetailItem icon={<Phone />} label="Phone" value={selectedLease.tenant.phone} />
                      <DetailItem icon={<Fingerprint />} label="National ID" value={selectedLease.tenant.nationalId} />
                    </div>
                  </div>
                </div>

                {/* Right Column: Document Preview */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Contract Document
                  </h3>

                  {selectedLease.contractUrl ? (
                    <div className="h-[450px] border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center p-2 shadow-inner relative overflow-hidden">
        
                      <div 
                        className="relative h-full w-full group cursor-zoom-in"
                        onClick={() => {
                          const safeJpgUrl = getImageUrl(selectedLease.contractUrl).replace(/\.pdf$/i, '.jpg');
                          window.open(safeJpgUrl, '_blank');
                        }}
                      >
                        <img 
                          src={getImageUrl(selectedLease.contractUrl).replace(/\.pdf$/i, '.jpg')} 
                          className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]" 
                          alt="Contract Preview"
                          onError={(e) => { e.target.src = 'https://placehold.co/400x600?text=Preview+Not+Available'; }}
                        />
                        
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="bg-white/90 px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2">
                              <ExternalLink className="h-4 w-4 text-blue-600" />
                              <span className="text-[10px] font-black uppercase">Open as Image</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-80 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-300">
                      <FileText className="h-16 w-16 mb-2 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">No Document Attached</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3">
              <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold" onClick={() => setIsModalOpen(false)}>Close Window</Button>
              {selectedLease.status === 'ACTIVE' && (
                <Button variant="destructive" className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-red-100" onClick={() => setIsConfirmOpen(true)}>
                   Terminate Agreement
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Confirm Terminate Modal --- */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-4">
                 <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-50">
                    <ShieldAlert className="h-10 w-10" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Cancel Contract?</h2>
                    <p className="text-sm text-slate-500 font-medium">This will set Room <span className="font-black text-red-600">{selectedLease?.room?.number}</span> back to <span className="font-bold text-emerald-600">VACANT</span>. This action is permanent.</p>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <Button disabled={terminating} variant="destructive" className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-red-200" onClick={handleTerminate}>
                    {terminating ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2 h-5 w-5" />}
                    Terminate Now
                 </Button>
                 <Button variant="ghost" className="h-12 rounded-2xl font-bold text-slate-400 hover:text-slate-600" onClick={() => setIsConfirmOpen(false)}>
                    Go Back
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  )
}

function DetailItem({ icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-blue-200">
      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">{React.cloneElement(icon, { className: "h-5 w-5" })}</div>
      <div className="overflow-hidden"><p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter leading-none mb-1">{label}</p><p className={cn("text-sm font-bold truncate", highlight ? "text-blue-600" : "text-slate-700")}>{value || "Not Set"}</p></div>
    </div>
  )
}