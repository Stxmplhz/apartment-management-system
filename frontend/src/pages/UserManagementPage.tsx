import { useState } from "react"
import { useUsers } from "@/hooks/useUsers"
import { UserTable } from "@/components/features/users/UserTable"
import { UserProfileDrawer } from "@/components/features/users/UserProfileDrawer"
import { AddTechnicianModal } from "@/components/features/users/AddTechnicianModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wrench, Loader2, Search, Users, ShieldCheck, UserCog } from "lucide-react"

export default function UserManagementPage() {
  const { filteredUsers, loading, searchQuery, setSearchQuery, actions } = useUsers()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isAddingTech, setIsAddingTech] = useState(false)

  if (loading && filteredUsers.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
  }

  const allUsers = (filteredUsers as any[])
  const tenantCount = allUsers.filter(u => u.role === 'TENANT').length
  const techCount = allUsers.filter(u => u.role === 'TECHNICIAN').length
  const activeCount = allUsers.filter(u => u.isActive).length

  const selectedUser = allUsers.find(u => u.id === selectedUserId)

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>User Administration</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage roles and system access</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search user..." className="pl-9 h-9 rounded-lg bg-secondary border-border text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => setIsAddingTech(true)} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9">
            <Wrench className="mr-1.5 h-3.5 w-3.5" /> Add Technician
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Tenants', value: tenantCount, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: Wrench, label: 'Technicians', value: techCount, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { icon: ShieldCheck, label: 'Active Accounts', value: activeCount, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <UserTable users={filteredUsers} onViewUser={(u) => setSelectedUserId(u.id)} />
      <UserProfileDrawer 
        user={selectedUser} 
        onClose={() => setSelectedUserId(null)} 
        actions={actions}
      />
      {isAddingTech && <AddTechnicianModal onClose={() => setIsAddingTech(false)} onSuccess={actions.refresh} />}
    </div>
  )
}
