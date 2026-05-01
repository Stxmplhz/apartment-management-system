import { UserCircle, Wrench, ShieldCheck } from 'lucide-react'

export function DemoCredentials() {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest text-center">Demo Accounts</p>
      <div className="grid grid-cols-1 gap-2 text-[11px]">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 border border-border/40 hover:bg-secondary/80 transition-colors">
          <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Admin</p>
            <p className="font-mono text-muted-foreground mt-0.5">admin@apartment.com / admin123</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 border border-border/40 hover:bg-secondary/80 transition-colors">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <UserCircle className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Tenant</p>
            <p className="font-mono text-muted-foreground mt-0.5">somchai@email.com / tenant123</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 border border-border/40 hover:bg-secondary/80 transition-colors">
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Wrench className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Technician</p>
            <p className="font-mono text-muted-foreground mt-0.5">tech@apartment.com / tech123</p>
          </div>
        </div>
      </div>
    </div>
  )
}