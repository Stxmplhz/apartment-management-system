// @ts-nocheck
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Upload } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function TenantProfileCard({ formData, files, availableRooms, actions }: any) {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-semibold flex items-center gap-2 border-b pb-3 text-blue-600">
        <UserPlus className="h-4 w-4" /> Tenant Details
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Room</Label>
          <Select value={formData.selectedRoom} onValueChange={actions.handleRoomSelect}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Choose a vacant room" /></SelectTrigger>
            <SelectContent>
              {availableRooms.map((r: any) => (
                <SelectItem key={r.id} value={r.id}>
                  Room {r.number} ({formatCurrency(r.pricePerMonth)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input required placeholder="Firstname Lastname" value={formData.name} onChange={e => actions.updateForm('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" required placeholder="tenant@email.com" value={formData.email} onChange={e => actions.updateForm('email', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input required value={formData.phone} onChange={e => actions.updateForm('phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>National ID</Label>
            <Input required maxLength={13} value={formData.nationalId} onChange={e => actions.updateForm('nationalId', e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Identification Image</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-secondary transition-colors relative cursor-pointer">
            <input type="file" required className="absolute inset-0 opacity-0" onChange={(e) => e.target.files && actions.handleFileChange('idFile', e.target.files[0])} />
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">{files.idFile ? files.idFile.name : "Click to upload ID Card Image"}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}