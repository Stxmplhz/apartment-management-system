import { Button } from "@/components/ui/button"
import { ShieldCheck, X, Eye } from "lucide-react"

export function UserTable({ users, onViewUser }: { users: any[], onViewUser: (user: any) => void }) {
  return (
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
          {users.map(u => (
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
                <Button variant="ghost" size="icon" onClick={() => onViewUser(u)}>
                  <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}