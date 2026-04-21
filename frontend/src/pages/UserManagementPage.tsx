import { useState } from "react"
import { useUsers } from "@/hooks/useUsers"
import { UserTable } from "@/components/features/users/UserTable"
import { UserProfileDrawer } from "@/components/features/users/UserProfileDrawer"
import { AddTechnicianModal } from "@/components/features/users/AddTechnicianModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wrench, Loader2, Search } from "lucide-react"

export default function UserManagementPage() {
  const { filteredUsers, loading, searchQuery, setSearchQuery, actions } = useUsers()
  
  // Local UI States
  const [selectedUser, setSelectedUser] = useState<any>(null) 
  const [isAddingTech, setIsAddingTech] = useState(false)

  if (loading && filteredUsers.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="space-y-6 pb-20 relative overflow-hidden">
      {/* Header & Search */}
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
          <Button onClick={() => setIsAddingTech(true)} className="bg-blue-600 hover:bg-blue-700">
            <Wrench className="mr-2 h-4 w-4" /> Add Technician
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <UserTable users={filteredUsers} onViewUser={setSelectedUser} />

      {/* Slide-out Drawer */}
      <UserProfileDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Modal */}
      {isAddingTech && (
        <AddTechnicianModal 
          onClose={() => setIsAddingTech(false)} 
          onSuccess={actions.refresh} 
        />
      )}
    </div>
  )
}