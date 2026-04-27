import { Button } from "@/components/ui/button"
import { ShieldCheck, X, Eye, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const roleStyle: Record<string, string> = {
  ADMIN:      "bg-purple-500/15 text-purple-400 border-purple-500/20",
  TECHNICIAN: "bg-amber-500/15  text-amber-400  border-amber-500/20",
  TENANT:     "bg-blue-500/15   text-blue-400   border-blue-500/20",
}

export function UserTable({ users, onViewUser }: { users: any[], onViewUser: (user: any) => void }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary border-b border-border">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Role</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 text-white",
                      u.role === 'ADMIN' ? "bg-gradient-to-br from-purple-500 to-pink-400" :
                      u.role === 'TECHNICIAN' ? "bg-gradient-to-br from-amber-500 to-orange-400" :
                      "bg-gradient-to-br from-blue-500 to-cyan-400"
                    )}>
                      {u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.email}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {u.tenantProfile ? `${u.tenantProfile.firstName} ${u.tenantProfile.lastName}` :
                         u.techProfile ? `${u.techProfile.firstName} ${u.techProfile.lastName}` :
                         "Staff Account"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden sm:table-cell">
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", roleStyle[u.role] ?? roleStyle.TENANT)}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  {u.isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <ShieldCheck className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <X className="h-3 w-3" /> Suspended
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => onViewUser(u)}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5">
                    <Eye className="h-3 w-3" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-20 bg-secondary/50 border-2 border-dashed border-border rounded-2xl">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No users found</p>
        </div>
      )}
    </div>
  )
}
