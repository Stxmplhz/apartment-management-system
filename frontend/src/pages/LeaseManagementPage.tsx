// @ts-nocheck
import React, { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { 
  Search, FileText, Calendar, User, CreditCard, 
  X, ImageIcon, Info, Phone, Fingerprint 
} from "lucide-react"
import { formatCurrency, getImageUrl, formatShortDate } from "@/lib/utils"
import { toast } from "sonner"

export default function LeaseManagementPage() {
  const [leases, setLeases] = useState([])
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLease, setSelectedLease] = useState(null)

  useEffect(() => { loadLeases() }, [])

  const loadLeases = async () => {
    try {
      const data = await api.leases.list()
      setLeases(data)
    } catch (e) { toast.error("Failed to load leases") }
  }

  const filteredLeases = leases.filter(l => 
    l.room.number.includes(search) || 
    l.tenant.firstName.toLowerCase().includes(search.toLowerCase())
  )

  const openDetail = (lease) => {
    setSelectedLease(lease)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lease Management</h1>
          <p className="text-muted-foreground text-sm">Review active contracts and tenant details</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search room or tenant..." 
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lease List Cards */}
      <div className="grid gap-4">
        {filteredLeases.map(lease => (
          <Card key={lease.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                  {lease.room.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{lease.tenant.firstName} {lease.tenant.lastName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      lease.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {lease.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Start: {new Date(lease.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openDetail(lease)}>
                   <Info className="h-4 w-4 mr-2" /> View Details
                </Button>
                {lease.status === 'ACTIVE' && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleTerminate(lease.id)}>
                    Terminate
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- Lease Detail Modal --- */}
      {isModalOpen && selectedLease && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                  {selectedLease.room.number}
                </div>
                <div>
                  <h2 className="text-xl font-bold leading-tight">Contract Detail View</h2>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Lease ID: {selectedLease.id.slice(-8)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-secondary/5">
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Column 1: Text Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Agreement Terms
                    </h3>
                    <div className="grid gap-4">
                      <DetailItem icon={<Calendar />} label="Start Date" value={new Date(selectedLease.startDate).toLocaleDateString()} />
                      <DetailItem icon={<Calendar />} label="End Date" value={selectedLease.endDate ? formatShortDate(selectedLease.endDate) : "Current Agreement"} />
                      <DetailItem icon={<CreditCard />} label="Monthly Rent" value={formatCurrency(selectedLease.agreedBaseRent)} highlight />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2">
                      <User className="h-4 w-4" /> Tenant Contact
                    </h3>
                    <div className="grid gap-4">
                      <DetailItem icon={<User />} label="Name" value={`${selectedLease.tenant.firstName} ${selectedLease.tenant.lastName}`} />
                      <DetailItem icon={<Phone />} label="Phone" value={selectedLease.tenant.phone} />
                      <DetailItem icon={<Fingerprint />} label="National ID" value={selectedLease.tenant.nationalId} />
                    </div>
                  </div>
                </div>

                {/* Column 2: Document Image */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Lease Contract Document
                  </h3>
                  {selectedLease.contractUrl ? (
                    <div className="border-2 border-dashed border-border rounded-2xl overflow-hidden bg-white p-2 shadow-inner">
                      <img 
                        src={getImageUrl(selectedLease.contractUrl)} 
                        alt="Signed Contract" 
                        className="w-full h-auto rounded-xl hover:scale-[1.02] transition-transform cursor-zoom-in"
                        onClick={() => window.open(getImageUrl(selectedLease.contractUrl), '_blank')}
                      />
                      <p className="text-[10px] text-center text-muted-foreground mt-3 italic">Click the image to view original size</p>
                    </div>
                  ) : (
                    <div className="h-64 rounded-2xl bg-secondary/20 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20">
                      <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                      <p className="text-sm text-muted-foreground">Contract image unavailable</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-card flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close Window</Button>
              {selectedLease.status === 'ACTIVE' && (
                <Button variant="destructive" onClick={() => { setIsModalOpen(false); handleTerminate(selectedLease.id); }}>
                  Terminate Lease
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  async function handleTerminate(id) {
    if(!confirm("Are you sure you want to terminate this lease? This will set room to VACANT.")) return
    try {
      await api.leases.terminate(id)
      toast.success("Lease terminated successfully")
      loadLeases()
    } catch (e) { toast.error("Error terminating lease") }
  }
}

function DetailItem({ icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border/50 shadow-sm transition-all hover:border-blue-200">
      <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{label}</p>
        <p className={`text-sm font-semibold truncate ${highlight ? 'text-blue-600' : 'text-foreground'}`}>
          {value || "N/A"}
        </p>
      </div>
    </div>
  )
}