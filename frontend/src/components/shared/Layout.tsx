import { Outlet, useLocation } from 'react-router-dom'
import { Navigation } from './Navigation'

const pageTitles: Record<string, [string, string]> = {
  '/': ['Room Directory', 'Manage all units'],
  '/move-in': ['Move-in Registration', 'Register new tenant'],
  '/leases': ['Lease Management', 'Active lease contracts'],
  '/meter': ['Billing & Utilities', 'Meter readings & invoices'],
  '/invoices': ['Invoices', 'Monthly billing records'],
  '/payments': ['Payment Verification', 'Review payment slips'],
  '/maintenance': ['Maintenance Tickets', 'Track repair requests'],
  '/users': ['User Administration', 'Manage roles & access'],
  '/dashboard': ['My Dashboard', 'Tenant overview'],
  '/my-invoices': ['My Invoices', 'Your billing history'],
  '/my-maintenance': ['My Maintenance', 'Your repair requests'],
}

export default function Layout() {
  const location = useLocation()
  const [title, subtitle] = pageTitles[location.pathname] ?? ['Dashboard', '']

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="md:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center px-6 gap-4 shadow-sm">
          <div className="flex-1">
            <h1 className="text-base font-medium text-foreground leading-tight" style={{ fontFamily: 'Lexend, sans-serif' }}>{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2 w-52 focus-within:border-blue-400 transition-colors">
            <svg className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full" placeholder="Search tenants, rooms…" />
          </div>
          <button className="h-9 w-9 rounded-lg bg-secondary border border-border flex items-center justify-center hover:border-blue-300 transition-colors relative">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-blue-500 rounded-full border border-card" />
          </button>
        </header>

        <main className="pt-14 md:pt-0">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
