import { Button } from "@/components/ui/button"
import { InfoItem } from "@/components/shared/InfoItem"
import { Users, Phone, Fingerprint, Image as ImageIcon, X } from "lucide-react"
import { getImageUrl } from "@/lib/utils"

export function UserProfileDrawer({ user, onClose }: { user: any, onClose: () => void }) {
  if (!user) return null;

  let fullName = "System User"
  let phone = "N/A"
  let nationalId = "Protected"
  let idCardUrl = null

  if (user.role === 'TENANT' && user.tenantProfile) {
    fullName = `${user.tenantProfile.firstName} ${user.tenantProfile.lastName}`
    phone = user.tenantProfile.phone || "N/A"
    nationalId = user.tenantProfile.nationalId || "Protected"
    idCardUrl = user.tenantProfile.idCardUrl
  } else if (user.role === 'TECHNICIAN' && user.techProfile) {
    // ดึงข้อมูลจาก techProfile ถ้าเป็นช่าง
    fullName = `${user.techProfile.firstName} ${user.techProfile.lastName}`
    phone = user.techProfile.phone || "N/A"
  } else if (user.role === 'ADMIN' && user.adminProfile) {
    // สมมติว่า Admin มีฟิลด์ staffId แทน (ตามใน schema)
    nationalId = `Staff ID: ${user.adminProfile.staffId}`
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-2xl z-[120] p-8 animate-in slide-in-from-right">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Profile View</h2>
        <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
      </div>

      <div className="space-y-6">
        <div className="text-center p-6 bg-secondary/20 rounded-3xl border border-dashed border-border">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="font-bold text-lg">{user.email}</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">{user.role}</p>
        </div>

        <div className="space-y-4">
          <InfoItem icon={<Users />} label="Full Name" value={fullName} />
          <InfoItem icon={<Phone />} label="Phone Number" value={phone} />
          
          {user.role !== 'TECHNICIAN' && (
             <InfoItem icon={<Fingerprint />} label="National ID / Staff ID" value={nationalId} />
          )}
          
          {idCardUrl && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> ID Card Document
              </p>
              <div className="border rounded-xl overflow-hidden bg-secondary/20 group relative">
                <img 
                  src={getImageUrl(idCardUrl)}
                  alt="ID Card" 
                  className="w-full h-auto cursor-zoom-in hover:opacity-90 transition-all"
                  onClick={() => window.open(getImageUrl(idCardUrl!), '_blank')}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black/20">
                  <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Click to view full size</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}