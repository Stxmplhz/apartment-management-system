import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { 
  TrendingUp, Users, Wrench, CreditCard, 
  ArrowUpRight, ArrowDownRight, Loader2, Calendar,
  Activity, Banknote
} from "lucide-react"
import { formatCurrency, formatDateEng } from "@/lib/utils"
import { cn } from "@/lib/utils"

// Standard dashboard fonts: Lexend for headers, Lexend for data
const dashboardFont = {
  header: { fontFamily: 'Lexend, sans-serif' },
  data: { fontFamily: 'Lexend, sans-serif' }
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.stats.dashboard()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 h-8 w-8" /></div>
  if (!data) return <div>Failed to load stats.</div>

  // Manual SVG Graph Calculations
  const maxRevenue = Math.max(...data.revenue.map((r: any) => r.revenue), 10000)
  const points = data.revenue.map((r: any, i: number) => {
    const x = (i / (data.revenue.length - 1)) * 100
    const y = 100 - (r.revenue / maxRevenue) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Management Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> System overview as of {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Occupancy Rate', value: `${data.occupancy.rate.toFixed(1)}%`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+2.5%', isUp: true },
          { label: 'Monthly Revenue', value: formatCurrency(data.revenue[5]?.revenue || 0), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+12%', isUp: true },
          { label: 'Pending Jobs', value: data.maintenance.pending, icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '-2', isUp: false },
          { label: 'Recent Payments', value: data.recentPayments.length, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'Active', isUp: true },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className={cn("flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border", 
                stat.isUp ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
              )}>
                {stat.isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-medium text-foreground mt-1 tracking-tight" style={dashboardFont.data}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (Manual SVG) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-foreground mb-6 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-blue-500" /> Revenue Analysis (Last 6 Months)
          </h3>
          <div className="h-[200px] w-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" className="text-border" strokeWidth="0.1" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-border" strokeWidth="0.1" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" className="text-border" strokeWidth="0.1" />
              
              {/* Area */}
              <polyline
                fill="url(#gradient)"
                points={`0,100 ${points} 100,100`}
                className="text-blue-500/10"
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={points}
                className="text-blue-500"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-4">
              {data.revenue.map((r: any) => (
                <span key={r.month} className="text-[9px] text-muted-foreground font-medium uppercase">
                  {r.month.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Occupancy Indicator */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-foreground mb-6 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" /> Occupancy Status
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 stroke-current"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500 stroke-current"
                  strokeWidth="3"
                  strokeDasharray={`${data.occupancy.rate}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-medium text-foreground" style={dashboardFont.data}>{data.occupancy.rate.toFixed(0)}%</span>
                <span className="text-[8px] uppercase font-medium text-muted-foreground tracking-tighter">Occupied</span>
              </div>
            </div>
            
            <div className="w-full space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[11px] font-medium text-muted-foreground">Occupied Rooms</span>
                </div>
                <span className="text-xs font-medium">{data.occupancy.occupied}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="text-[11px] font-medium text-muted-foreground">Vacant Rooms</span>
                </div>
                <span className="text-xs font-medium">{data.occupancy.vacant}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Recent Financial Activity</h3>
          <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase">Live Updates</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/50 text-[10px] font-medium text-muted-foreground uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recentPayments.map((p: any) => (
                <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px] font-medium">
                        {p.tenant[0]}
                      </div>
                      <span className="text-sm font-medium text-foreground">{p.tenant}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground" style={dashboardFont.data}>{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground" style={dashboardFont.data}>{formatDateEng(p.date)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      p.status === 'PAID' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
