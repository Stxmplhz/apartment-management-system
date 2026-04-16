// @ts-nocheck
import { useState, useCallback, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, CheckCircle, UserPlus, FileText, Loader2, Zap, Droplets, Landmark } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export default function MoveInPage() {
  const [availableRooms, setAvailableRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [generatedPass, setGeneratedPass] = useState(null)

  // Form States
  const [selectedRoom, setSelectedRoom] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [rent, setRent] = useState("")
  const [initElec, setInitElec] = useState("0")
  const [initWater, setInitWater] = useState("0")
  const [idFile, setIdFile] = useState(null)

  useEffect(() => { loadAvailableRooms() }, [])

  const loadAvailableRooms = async () => {
    try {
      const rooms = await api.rooms.list({ status: 'VACANT' })
      setAvailableRooms(rooms)
    } catch (error) { toast.error('Failed to load rooms') } 
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!idFile) return toast.error("Please upload ID image")
    
    setSubmitting(true)
    try {
      const nameParts = name.trim().split(/\s+/)
      
      const formData = new FormData()
      formData.append('email', email)
      formData.append('firstName', nameParts[0])
      formData.append('lastName', nameParts.slice(1).join(" ") || "-")
      formData.append('phone', phone)
      formData.append('nationalId', nationalId)
      formData.append('roomId', selectedRoom)
      formData.append('startDate', new Date().toISOString())
      formData.append('agreedBaseRent', String(rent || "0"))
      formData.append('initialElectricity', String(initElec || "0"))
      formData.append('initialWater', String(initWater || "0"))
      formData.append('idCardFile', idFile)

      const res = await api.tenants.create(formData)
      
      if (res.error) throw new Error(res.error)

      setGeneratedPass(res.tempPassword)
      setSubmitted(true)
      toast.success('Registration Complete')
    } catch (error) { 
      toast.error(error.message) 
    } finally { setSubmitting(false) }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl text-center space-y-6 bg-card shadow-lg animate-in zoom-in-95">
        <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Registration Complete!</h2>
          <p className="text-muted-foreground text-sm">Tenant account and lease created.</p>
        </div>
        <div className="p-6 bg-secondary/50 rounded-xl space-y-2 border border-dashed">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Temporary Password</p>
          <p className="font-mono text-3xl font-bold text-primary tracking-widest">{generatedPass}</p>
        </div>
        <Button onClick={() => window.location.reload()} className="w-full">Next Registration</Button>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <h1 className="text-2xl font-bold tracking-tight">Move-in Registration</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Tenant Profile */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2 border-b pb-3 text-blue-600"><UserPlus className="h-4 w-4" /> Tenant Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Room</Label>
              <Select value={selectedRoom} onValueChange={(val) => {
                setSelectedRoom(val)
                const r = availableRooms.find(rm => rm.id === val)
                if(r) setRent(r.pricePerMonth.toString())
              }}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Choose a vacant room" /></SelectTrigger>
                <SelectContent>{availableRooms.map(r => <SelectItem key={r.id} value={r.id}>Room {r.number} ({formatCurrency(r.pricePerMonth)})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Full Name</Label><Input required placeholder="Firstname Lastname" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" required placeholder="tenant@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input required value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div className="space-y-2"><Label>National ID</Label><Input required maxLength={13} value={nationalId} onChange={e => setNationalId(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Identification Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-secondary transition-colors relative cursor-pointer">
                <input type="file" required className="absolute inset-0 opacity-0" onChange={(e) => setIdFile(e.target.files[0])} />
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{idFile ? idFile.name : "Click to upload ID Card Image"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Lease & Initial Meter */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h2 className="font-semibold flex items-center gap-2 border-b pb-3 text-blue-600"><Landmark className="h-4 w-4" /> Lease Terms</h2>
            <div className="space-y-2">
              <Label>Monthly Rent (THB)</Label>
              <Input type="number" required value={rent} onChange={e => setRent(e.target.value)} className="text-xl font-bold text-emerald-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="flex gap-1 text-xs"><Zap className="h-3 w-3" /> Initial Electric</Label><Input type="number" value={initElec} onChange={e => setInitElec(e.target.value)} /></div>
              <div className="space-y-2"><Label className="flex gap-1 text-xs"><Droplets className="h-3 w-3" /> Initial Water</Label><Input type="number" value={initWater} onChange={e => setInitWater(e.target.value)} /></div>
            </div>
          </Card>
          <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold shadow-md" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2" />}
            Register & Generate Account
          </Button>
        </div>
      </form>
    </div>
  )
}