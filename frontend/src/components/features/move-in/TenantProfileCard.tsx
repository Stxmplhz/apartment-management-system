// @ts-nocheck
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Upload, CheckCircle, DoorOpen } from "lucide-react"

export function TenantProfileCard({ formData, files, availableRooms, actions }: any) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-blue-500" />
        <h2 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Tenant Details</h2>
      </div>
      <div className="p-5 space-y-4">
        {/* Room select */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Select Room</Label>
          <Select value={formData.selectedRoom} onValueChange={actions.handleRoomSelect}>
            <SelectTrigger className="h-9 rounded-lg bg-secondary border-border text-sm">
              <SelectValue placeholder="Choose a vacant room" />
            </SelectTrigger>
            <SelectContent>
              {availableRooms.map((r: any) => (
                <SelectItem key={r.id} value={r.id}>
                  <span className="flex items-center gap-2">
                    <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    Room {r.number}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Full name */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
          <Input required placeholder="Firstname Lastname" value={formData.name} onChange={e => actions.updateForm('name', e.target.value)} className="h-9 rounded-lg bg-secondary border-border text-sm" />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Email</Label>
          <Input type="email" required placeholder="tenant@email.com" value={formData.email} onChange={e => actions.updateForm('email', e.target.value)} className="h-9 rounded-lg bg-secondary border-border text-sm" />
        </div>

        {/* Phone + National ID */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
            <Input required value={formData.phone} onChange={e => actions.updateForm('phone', e.target.value)} className="h-9 rounded-lg bg-secondary border-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">National ID</Label>
            <Input required maxLength={13} value={formData.nationalId} onChange={e => actions.updateForm('nationalId', e.target.value)} className="h-9 rounded-lg bg-secondary border-border text-sm" />
          </div>
        </div>

        {/* ID upload */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">ID Card Image</Label>
          <div className="relative border-2 border-dashed border-border rounded-lg p-5 text-center hover:bg-secondary/50 transition-colors cursor-pointer">
            <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && actions.handleFileChange('idFile', e.target.files[0])} />
            {files.idFile ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">{files.idFile.name}</span>
              </div>
            ) : (
              <>
                <Upload className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Click to upload ID Card</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG up to 10MB</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
