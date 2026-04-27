import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, X, Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Portal } from "@/components/ui/portal"

export function AddTechnicianModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', phone: '', expertise: '' })
  const [tempPass, setTempPass] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const autoPass = Math.random().toString(36).slice(-8)
      await api.auth.registerTechnician({ ...form, password: autoPass })
      setTempPass(autoPass)
      onSuccess()
      toast.success("Technician registered!")
    } catch { toast.error("Registration failed") }
    finally { setSubmitting(false) }
  }

  const handleCopy = () => {
    if (tempPass) {
      navigator.clipboard.writeText(tempPass)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

        {!tempPass ? (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Register Technician</h2>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Work Email</Label>
                <Input type="email" required placeholder="staff@apartment.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="h-9 rounded-lg bg-secondary border-border text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">First Name</Label>
                  <Input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="h-9 rounded-lg bg-secondary border-border text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Last Name</Label>
                  <Input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="h-9 rounded-lg bg-secondary border-border text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                  <Input required placeholder="08X-XXX-XXXX" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="h-9 rounded-lg bg-secondary border-border text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Specialty</Label>
                  <Input placeholder="e.g. Electrician" value={form.expertise}
                    onChange={e => setForm({ ...form, expertise: e.target.value })}
                    className="h-9 rounded-lg bg-secondary border-border text-sm" />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-border flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-9" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={submitting} size="sm" className="rounded-lg h-9 bg-blue-500 hover:bg-blue-600 text-white px-6">
                {submitting ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : null}
                Create Account
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-5">
            <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mx-auto">
              <Key className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Technician Registered</h3>
              <p className="text-xs text-muted-foreground mt-1">Share this temporary password with the staff</p>
            </div>
            <div className="relative">
              <div className="p-4 bg-secondary border border-border rounded-xl font-mono text-2xl tracking-widest font-medium text-foreground select-all">
                {tempPass}
              </div>
              <button onClick={handleCopy}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            </div>
            <Button className="w-full h-9 rounded-lg bg-foreground hover:bg-foreground/90 text-background text-sm font-medium" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
    </Portal>
  )
}
