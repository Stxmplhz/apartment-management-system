import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Phone, Fingerprint, Image as ImageIcon, X, Wrench, ShieldCheck, Key, ShieldAlert, Loader2 } from "lucide-react"
import { cn, getImageUrl } from "@/lib/utils"
import { Portal } from "@/components/ui/portal"

const roleStyle: Record<string, string> = {
  ADMIN:      "bg-purple-500/15 text-purple-400 border-purple-500/20",
  TECHNICIAN: "bg-amber-500/15  text-amber-400  border-amber-500/20",
  TENANT:     "bg-blue-500/15   text-blue-400   border-blue-500/20",
}

export function UserProfileDrawer({ user, onClose, actions }: { 
  user: any, 
  onClose: () => void,
  actions: {
    toggleStatus: (id: string, current: boolean) => Promise<void>,
    changeRole: (id: string, role: string) => Promise<void>,
    resetPassword: (id: string, pass: string) => Promise<void>
  }
}) {
  const [isResetting, setIsResetting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  if (!user) return null

  let fullName = "System User"
  let phone = "N/A"
  let nationalId = "Protected"
  let idCardUrl = null
  let extra = ""

  if (user.role === 'TENANT' && user.tenantProfile) {
    fullName = `${user.tenantProfile.firstName} ${user.tenantProfile.lastName}`
    phone = user.tenantProfile.phone || "N/A"
    nationalId = user.tenantProfile.nationalId || "Protected"
    idCardUrl = user.tenantProfile.idCardUrl
  } else if (user.role === 'TECHNICIAN' && user.techProfile) {
    fullName = `${user.techProfile.firstName} ${user.techProfile.lastName}`
    phone = user.techProfile.phone || "N/A"
    extra = user.techProfile.expertise || ""
  } else if (user.role === 'ADMIN' && user.adminProfile) {
    nationalId = `Staff ID: ${user.adminProfile.staffId}`
  }

  const handleResetPassword = async () => {
    const newPass = prompt("Enter new password (min 6 characters):")
    if (newPass && newPass.length >= 6) {
      setIsResetting(true)
      await actions.resetPassword(user.id, newPass)
      setIsResetting(false)
    } else if (newPass) {
      alert("Password too short!")
    }
  }

  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true)
    await actions.toggleStatus(user.id, user.isActive)
    setIsUpdatingStatus(false)
  }

  const handleChangeRole = async (role: string) => {
    if (role === user.role) return
    setUpdatingRole(role)
    await actions.changeRole(user.id, role)
    setUpdatingRole(null)
  }

  return (
    <Portal>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]" onClick={onClose} />

      <div className="fixed inset-0 left-auto w-full max-w-sm bg-card border-l border-border shadow-2xl z-[201] flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Profile Administration</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center p-6 bg-secondary rounded-xl border border-border">
            <div className={cn("h-14 w-14 rounded-full flex items-center justify-center text-xl font-medium mb-3 text-white",
              user.role === 'ADMIN' ? "bg-gradient-to-br from-purple-500 to-pink-400" :
              user.role === 'TECHNICIAN' ? "bg-gradient-to-br from-amber-500 to-orange-400" :
              "bg-gradient-to-br from-blue-500 to-cyan-400"
            )}>
              {user.email[0].toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-foreground">{user.email}</p>
            
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {['ADMIN', 'TECHNICIAN', 'TENANT'].map(r => (
                <button
                  key={r}
                  disabled={updatingRole !== null}
                  onClick={() => handleChangeRole(r)}
                  className={cn(
                    "text-[10px] font-medium px-2.5 py-1 rounded-md border transition-all flex items-center gap-1",
                    user.role === r 
                      ? roleStyle[r] 
                      : "bg-transparent border-border text-muted-foreground hover:border-blue-500/30 hover:text-foreground"
                  )}
                >
                  {updatingRole === r && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isUpdatingStatus}
              onClick={handleToggleStatus}
              className={cn("h-10 rounded-xl text-xs font-semibold shadow-sm", user.isActive ? "text-red-500 border-red-500/20 hover:bg-red-50" : "text-emerald-500 border-emerald-500/20 hover:bg-emerald-50")}
            >
              {isUpdatingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : user.isActive ? <ShieldAlert className="h-3.5 w-3.5 mr-2" /> : <ShieldCheck className="h-3.5 w-3.5 mr-2" />}
              {isUpdatingStatus ? "Updating..." : user.isActive ? "Suspend" : "Activate"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isResetting}
              onClick={handleResetPassword}
              className="h-10 rounded-xl text-xs font-semibold text-blue-500 border-blue-500/20 hover:bg-blue-50 shadow-sm"
            >
              {isResetting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Key className="h-3.5 w-3.5 mr-2" />}
              {isResetting ? "Resetting..." : "Reset Pass"}
            </Button>
          </div>

          {/* Info rows */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {[
              { icon: Users, label: "Full Name", value: fullName },
              { icon: Phone, label: "Phone", value: phone },
              ...(user.role !== 'TECHNICIAN' ? [{ icon: Fingerprint, label: "National ID / Staff ID", value: nationalId }] : []),
              ...(extra ? [{ icon: Wrench, label: "Expertise", value: extra }] : []),
              { icon: ShieldCheck, label: "Account Status", value: user.isActive ? "Active" : "Suspended" },
            ].map(({ icon: Icon, label, value }, i, arr) => (
              <div key={label} className={cn("flex items-center gap-3 px-4 py-3", i < arr.length - 1 && "border-b border-border")}>
                <div className="h-7 w-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ID Card */}
          {idCardUrl && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
                <ImageIcon className="h-3 w-3" /> ID Card Document
              </p>
              <div className="border border-border rounded-xl overflow-hidden bg-secondary group relative cursor-zoom-in"
                onClick={() => window.open(getImageUrl(idCardUrl!), '_blank')}>
                <img src={getImageUrl(idCardUrl)} alt="ID Card" className="w-full h-auto group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <span className="bg-card/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm">View full size</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  )
}
