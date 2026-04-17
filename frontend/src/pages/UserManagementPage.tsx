// @ts-nocheck
import React, { useState, useEffect } from "react" 
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  UserPlus, ShieldCheck, Wrench, Users, Loader2, 
  Trash2, Key, X, Search, Eye, Phone, Fingerprint, Image as ImageIcon 
} from "lucide-react"
import { toast } from "sonner"
import { getImageUrl } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(null) 
  const [isAddingTech, setIsAddingTech] = useState(false)
  const [techForm, setTechForm] = useState({ email: '', firstName: '', lastName: '', expertise: '' })
  const [tempPass, setTempPass] = useState(null)

  useEffect(() => { loadAllUsers() }, [])

  const loadAllUsers = async () => {
    try {
      setLoading(true)
      const data = await api.users.list()
      setUsers(data)
    } catch (error) { toast.error("Failed to fetch users") }
    finally { setLoading(false) }
  }

  const handleAddTech = async (e) => {
    e.preventDefault()
    try {
      const autoPass = Math.random().toString(36).slice(-8)
      await api.auth.registerTechnician({ ...techForm, password: autoPass })
      setTempPass(autoPass)
      loadAllUsers()
      toast.success("Technician added!")
    } catch (error) { toast.error("Registration failed") }
  }

  const filteredUsers = users.filter(u => {
    const searchTarget = `
      ${u.email} 
      ${u.tenantProfile?.firstName || ''} 
      ${u.tenantProfile?.lastName || ''}
      ${u.techProfile?.firstName || ''}
    `.toLowerCase()
    return searchTarget.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Management</h1>
          <p className="text-muted-foreground text-sm">Control and monitor system access</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search user..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Add Tech */}
          <Button onClick={() => { setIsAddingTech(true); setTempPass(null); }} className="bg-blue-600 hover:bg-blue-700">
            <Wrench className="mr-2 h-4 w-4" /> Add Technician
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-secondary/30 text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-b">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-secondary/10 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-sm">{u.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {u.tenantProfile ? `${u.tenantProfile.firstName} ${u.tenantProfile.lastName}` : "Staff / System Account"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'TECHNICIAN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  {u.isActive ? 
                    <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> ACTIVE</span> : 
                    <span className="text-red-400 text-[10px] font-bold flex items-center gap-1"><X className="h-3 w-3" /> SUSPENDED</span>
                  }
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedUser(u)}>
                    <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Side Panel (Drawer) */}
      {selectedUser && (
        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-2xl z-[120] p-8 animate-in slide-in-from-right">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Profile View</h2>
            <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}><X /></Button>
          </div>

          <div className="space-y-6">
            <div className="text-center p-6 bg-secondary/20 rounded-3xl border border-dashed border-border">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <p className="font-bold text-lg">{selectedUser.email}</p>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">{selectedUser.role}</p>
            </div>

            <div className="space-y-4">
              <InfoItem icon={<Users />} label="Full Name" value={selectedUser.tenantProfile ? `${selectedUser.tenantProfile.firstName} ${selectedUser.tenantProfile.lastName}` : "System User"} />
              <InfoItem icon={<Phone />} label="Phone Number" value={selectedUser.tenantProfile?.phone || "N/A"} />
              <InfoItem icon={<Fingerprint />} label="National ID" value={selectedUser.tenantProfile?.nationalId || "Protected"} />
              {selectedUser.tenantProfile?.idCardUrl && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> ID Card Document
                  </p>
                  <div className="border rounded-xl overflow-hidden bg-secondary/20 group relative">
                    <img 
                      src={getImageUrl(selectedUser.tenantProfile.idCardUrl)}
                      alt="ID Card" 
                      className="w-full h-auto cursor-zoom-in hover:opacity-90 transition-all"
                      onClick={() => window.open(getImageUrl(selectedUser.tenantProfile.idCardUrl), '_blank')}
                    />
                    <div class Name="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black/20">
                      <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Click to view full size</span>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}

      {/* Add Tech Modal */}
      {isAddingTech && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
            {!tempPass ? (
              <form onSubmit={handleAddTech}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Register Technician</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsAddingTech(false)}><X className="h-4 w-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Work Email</Label>
                    <Input type="email" required placeholder="staff@apartment.com" value={techForm.email} onChange={e => setTechForm({...techForm, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>First Name</Label><Input required value={techForm.firstName} onChange={e => setTechForm({...techForm, firstName: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input required value={techForm.lastName} onChange={e => setTechForm({...techForm, lastName: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <Input placeholder="e.g. Electrician" value={techForm.expertise} onChange={e => setTechForm({...techForm, expertise: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-primary text-primary-foreground">Create Account</Button>
                </CardContent>
              </form>
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto"><Key className="h-6 w-6" /></div>
                <h3 className="font-bold text-lg text-foreground">Technician Registered</h3>
                <p className="text-sm text-muted-foreground">Give this temporary password to the staff:</p>
                <div className="p-4 bg-secondary rounded-xl font-mono text-2xl tracking-widest border border-dashed border-primary/30 select-all font-bold">
                  {tempPass}
                </div>
                <Button className="w-full" onClick={() => { setIsAddingTech(false); setTempPass(null); setTechForm({email:'', firstName:'', lastName:'', expertise:''}) }}>Close</Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border">
        {React.cloneElement(icon, { className: "h-5 w-5 text-muted-foreground" })}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}