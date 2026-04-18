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
  ArrowUpDown, SortAsc, SortDesc, Layers
} from "lucide-react"
import { formatCurrency, getImageUrl, formatShortDate } from "@/lib/utils"
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
    const diffTime = Math.abs(now - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} days`
    const months = Math.floor(diffDays / 30)
    if (months < 12) return `${months} months`
    
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    return `${years}y ${remainingMonths}m`
  }

  const processedLeases = leases
    .filter(l => {
      const matchesSearch = l.room.number.includes(search) || 
                           l.tenant.firstName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || l.status === statusFilter
      const matchesFloor = floorFilter === "all" || l.room.floor.toString() === floorFilter
      return matchesSearch && matchesStatus && matchesFloor
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.startDate) - new Date(a.startDate)
      if (sortBy === "oldest") return new Date(a.startDate) - new Date(b.startDate)
      if (sortBy === "room") return a.room.number.localeCompare(b.room.number, undefined, {numeric: true})
      return 0
    })

  const uniqueFloors = [...new Set(leases.map(l => l.room.floor))].sort()

  const openDetail = (lease) => {
    setSelectedLease(lease)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Lease Management</h1>
          <p className="text-muted-foreground text-sm font-medium">Monitoring {leases.length} historical and active contracts</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Room or tenant..." 
              className="pl-10 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-blue-500 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Sort Selector */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-12 px-4 rounded-2xl bg-slate-50 border-none text-xs font-bold uppercase tracking-wider text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="room">By Room #</option>
          </select>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
          {['all', 'ACTIVE', 'TERMINATED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                statusFilter === status ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => setFloorFilter("all")}
            className={cn(
              "px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase",
              floorFilter === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
            )}
          >
            All Floors
          </button>
          {uniqueFloors.map(floor => (
            <button
              key={floor}
              onClick={() => setFloorFilter(floor.toString())}
              className={cn(
                "px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase",
                floorFilter === floor.toString() ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              )}
            >
              F{floor}
            </button>
          ))}
        </div>
      </div>

      {/* Lease List */}
      <div className="grid gap-4">
        {processedLeases.map(lease => (
          <Card key={lease.id} className="p-5 hover:shadow-xl transition-all border-none shadow-md bg-white rounded-[2rem] group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-100">
                  <span className="text-[10px] font-black opacity-60 uppercase tracking-tighter">Room</span>
                  <span className="text-xl font-black">{lease.room.number}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-xl text-slate-900">{lease.tenant.firstName} {lease.tenant.lastName}</p>
                    <span className={cn(
                      "text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm",
                      lease.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                    )}>
                      {lease.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-slate-500">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      Duration: {getLeaseAge(lease.startDate)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Start: {new Date(lease.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right mr-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Monthly Rate</p>
                   <p className="text-lg font-black text-blue-600">{formatCurrency(lease.agreedBaseRent)}</p>
                </div>
                <Button 
                  onClick={() => openDetail(lease)}
                  className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-black font-bold"
                >
                   <Info className="h-4 w-4 mr-2" /> Details
                </Button>
                {lease.status === 'ACTIVE' && (
                  <Button 
                    variant="ghost" 
                    className="h-12 w-12 rounded-2xl text-red-500 hover:bg-red-50"
                    onClick={() => handleTerminate(lease.id)}
                  >
                    <AlertCircle className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {processedLeases.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="font-bold text-slate-400 uppercase tracking-widest">No matching leases found</p>
        </div>
      )}

      {/* --- Detail Modal --- */}
      {isModalOpen && selectedLease && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
            
            <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl">
                  {selectedLease.room.number}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Lease Agreement</h2>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Floor {selectedLease.room.floor} • ID: {selectedLease.id.slice(-8)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" onClick={() => setIsModalOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid md:grid-cols-2 gap-10">
                
                <div className="space-y-8">
                  {/* Age Section */}
                  <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <Hourglass className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Stay Duration</p>
                      <p className="text-xl font-black text-blue-700">{getLeaseAge(selectedLease.startDate)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Contractual Terms
                    </h3>
                    <div className="grid gap-3">
                      <DetailItem icon={<Calendar />} label="Start Date" value={new Date(selectedLease.startDate).toLocaleDateString()} />
                      <DetailItem icon={<Calendar />} label="Contract End" value={selectedLease.endDate ? formatShortDate(selectedLease.endDate) : "Indefinite"} />
                      <DetailItem icon={<CreditCard />} label="Base Monthly Rent" value={formatCurrency(selectedLease.agreedBaseRent)} highlight />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                      <User className="h-4 w-4" /> Tenant Profile
                    </h3>
                    <div className="grid gap-3">
                      <DetailItem icon={<User />} label="Tenant Name" value={`${selectedLease.tenant.firstName} ${selectedLease.tenant.lastName}`} />
                      <DetailItem icon={<Phone />} label="Phone Contact" value={selectedLease.tenant.phone} />
                      <DetailItem icon={<Fingerprint />} label="National ID" value={selectedLease.tenant.nationalId} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Document Preview
                  </h3>
                  {selectedLease.contractUrl ? (
                    <div className="group relative border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden bg-slate-50 p-3 shadow-inner">
                      <img 
                        src={getImageUrl(selectedLease.contractUrl)} 
                        alt="Contract" 
                        className="w-full h-auto rounded-2xl shadow-sm group-hover:scale-[1.01] transition-transform cursor-zoom-in"
                        onClick={() => window.open(getImageUrl(selectedLease.contractUrl), '_blank')}
                      />
                    </div>
                  ) : (
                    <div className="h-80 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-300">
                      <FileText className="h-16 w-16 mb-2 opacity-20" />
                      <p className="text-xs font-black uppercase">No Document Image</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50 flex justify-end gap-3">
              <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold" onClick={() => setIsModalOpen(false)}>Close</Button>
              {selectedLease.status === 'ACTIVE' && (
                <Button variant="destructive" className="rounded-2xl h-12 px-8 font-bold" onClick={() => { setIsModalOpen(false); handleTerminate(selectedLease.id); }}>
                  Terminate Agreement
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  async function handleTerminate(id) {
    if(!confirm("Warning: Terminating this lease will set the room status back to VACANT. Continue?")) return
    try {
      await api.leases.terminate(id)
      toast.success("Lease terminated")
      loadLeases()
    } catch (e) { toast.error("Error in termination process") }
  }
}

function DetailItem({ icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <div className="overflow-hidden">
        <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter leading-none mb-1">{label}</p>
        <p className={cn("text-sm font-bold truncate", highlight ? "text-blue-600" : "text-slate-700")}>
          {value || "Not Specified"}
        </p>
      </div>
    </div>
  )
}