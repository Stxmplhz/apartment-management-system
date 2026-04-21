import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, X } from "lucide-react"
import { toast } from "sonner"

export function AddTechnicianModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [techForm, setTechForm] = useState({ email: '', firstName: '', lastName: '', phone: '', expertise: '' })    
  const [tempPass, setTempPass] = useState<string | null>(null)

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const autoPass = Math.random().toString(36).slice(-8)
      await api.auth.registerTechnician({ ...techForm, password: autoPass })
      setTempPass(autoPass)
      onSuccess() // Refresh user table
      toast.success("Technician added!")
    } catch (error) { 
      toast.error("Registration failed") 
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
        {!tempPass ? (
          <form onSubmit={handleAddTech}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Register Technician</CardTitle>
              <Button type="button" variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input required placeholder="08X-XXX-XXXX" value={techForm.phone} onChange={e => setTechForm({...techForm, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Input placeholder="e.g. Electrician" value={techForm.expertise} onChange={e => setTechForm({...techForm, expertise: e.target.value})} />
                </div>
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
            <Button className="w-full" onClick={onClose}>Close</Button>
          </div>
        )}
      </Card>
    </div>
  )
}