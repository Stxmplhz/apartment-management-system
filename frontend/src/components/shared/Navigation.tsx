import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Building2, UserPlus, Gauge, FileText, CreditCard, Menu, X, Wrench, Home, LogOut, Users, LayoutDashboard } from "lucide-react"

export function Navigation() {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const getNavItems = () => {
    if (!user) return []
    if (user.role === 'ADMIN') {
      return [
        { href: "/", label: "Dashboard", icon: LayoutDashboard, section: "Main" },
        { href: "/rooms", label: "Rooms", icon: Building2, section: "Main" },
        { href: "/move-in", label: "Move-in", icon: UserPlus, section: "Main" },
        { href: "/leases", label: "Leases", icon: FileText, section: "Main" },
        { href: "/meter", label: "Billing & Utilities", icon: Gauge, section: "Finance" },
        { href: "/invoices", label: "Invoices", icon: FileText, section: "Finance" },
        { href: "/payments", label: "Payments", icon: CreditCard, section: "Finance" },
        { href: "/maintenance", label: "Maintenance", icon: Wrench, section: "Operations" },
        { href: "/users", label: "User Admin", icon: Users, section: "Operations" },
      ]
    }
    if (user.role === 'TENANT') {
      return [
        { href: "/dashboard", label: "Dashboard", icon: Home, section: "Main" },
        { href: "/my-invoices", label: "My Invoices", icon: FileText, section: "Main" },
        { href: "/my-maintenance", label: "Maintenance", icon: Wrench, section: "Main" },
      ]
    } else if (user.role === 'TECHNICIAN') {
      return [{ href: "/maintenance", label: "Assignments", icon: Wrench, section: "Main" }]
    }
    return []
  }

  const navItems = getNavItems()

  const getInitials = () => {
    if (!user?.profile) return user?.role?.slice(0, 2) ?? 'U'
    const p = user.profile as any
    if (p.firstName && p.lastName) return `${p.firstName[0]}${p.lastName[0]}`
    if (p.staffId) return 'AD'
    return user.role.slice(0, 2)
  }

  const getDisplayName = () => {
    if (!user?.profile) return user?.email ?? ''
    const p = user.profile as any
    if (p.firstName) return `${p.firstName} ${p.lastName ?? ''}`
    return user.email
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Group nav items by section
  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, typeof navItems>)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border/60 flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="font-medium text-sm text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>NestAdmin</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Management System</div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="mb-4">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1.5">{section}</div>
            {items.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-600 font-medium border border-blue-100"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-blue-500" : "")} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border/60 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">{getDisplayName()}</div>
            <div className="text-[11px] text-muted-foreground">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 md:hidden z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-sm" style={{ fontFamily: 'Lexend, sans-serif' }}>NestAdmin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Nav */}
      <div className={cn(
        "fixed top-14 left-0 right-0 bg-card border-b border-border z-40 md:hidden transition-all duration-200 shadow-lg",
        mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <div className="p-3 max-h-[70vh] overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                pathname === item.href
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => { handleLogout(); setMobileOpen(false) }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors w-full text-left mt-1"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-card border-r border-border flex-col shadow-sm">
        <SidebarContent />
      </aside>
    </>
  )
}
