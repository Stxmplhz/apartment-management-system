import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Building2, UserPlus, Gauge, FileText, CreditCard, Menu, X, Wrench, Home, LogOut } from "lucide-react"

export function Navigation() {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) return []

    if (user.role === 'ADMIN') {
      return [
        { href: "/", label: "Rooms", icon: Building2 },
        { href: "/move-in", label: "Move-in", icon: UserPlus },
        { href: "/meter", label: "Meter", icon: Gauge },
        { href: "/invoices", label: "Invoices", icon: FileText },
        { href: "/payments", label: "Payments", icon: CreditCard },
        { href: "/maintenance", label: "Maintenance", icon: Wrench },
      ]
    } else if (user.role === 'TENANT') {
      return [
        { href: "/dashboard", label: "My Dashboard", icon: Home },
        { href: "/invoices", label: "My Invoices", icon: FileText },
        { href: "/payments", label: "My Payments", icon: CreditCard },
        { href: "/maintenance", label: "My Requests", icon: Wrench },
      ]
    } else if (user.role === 'TECHNICIAN') {
      return [
        { href: "/maintenance", label: "Assignments", icon: Wrench },
      ]
    }
    
    return []
  }

  const navItems = getNavItems()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between px-4 md:hidden z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
            <Building2 className="h-4 w-4 text-background" />
          </div>
          <span className="font-semibold text-sm">ApartmentOS</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Nav */}
      <nav className={cn(
        "fixed top-14 left-0 right-0 bg-card border-b border-border z-40 md:hidden transition-all duration-200",
        mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <div className="p-2 flex flex-col gap-0.5">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              handleLogout()
              setMobileOpen(false)
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-card border-r border-border flex-col">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
            <Building2 className="h-4 w-4 text-background" />
          </div>
          <span className="font-semibold text-sm">ApartmentOS</span>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
