import { useState, useEffect } from "react"
import { useMeters } from "@/hooks/useMeters"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency } from "@/lib/utils"
import { Loader2, CheckCircle, Zap, Droplets, FileText, Save } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"

const invStatusStyle: Record<string, string> = {
  PAID:           "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  UNPAID:         "bg-amber-500/15  text-amber-500  border-amber-500/20",
  PENDING_VERIFY: "bg-blue-500/15   text-blue-500   border-blue-500/20",
  OVERDUE:        "bg-red-500/15    text-red-500    border-red-500/20",
}
const invStatusLabel: Record<string, string> = {
  PAID: "Paid", UNPAID: "Unpaid", PENDING_VERIFY: "Pending", OVERDUE: "Overdue"
}

export default function MeterReadingPage() {
  const { filteredRooms, meterData, loading, submitting, stats, rates, filters, actions } = useMeters()
  const [generating, setGenerating] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [invLoading, setInvLoading] = useState(false)

  const loadInvoices = async (month?: string) => {
    try {
      setInvLoading(true)
      const data = await api.invoices.list({ month: month ?? filters.selectedMonth })
      setInvoices(data)
    } catch {} finally { setInvLoading(false) }
  }

  useEffect(() => { loadInvoices(filters.selectedMonth) }, [filters.selectedMonth])

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault()
    await actions.handleSubmit(e)
    loadInvoices()
  }

  const handleGenerateAll = async () => {
    const readyRooms = filteredRooms.filter(r => r.isSaved)
    if (readyRooms.length === 0) return toast.error('No rooms with saved meter readings')
    try {
      setGenerating(true)
      toast.loading(`Generating invoices for ${readyRooms.length} room(s)...`, { id: 'gen-all' })
      let success = 0
      for (const room of readyRooms) {
        try {
          await api.invoices.generate({ roomId: room.id, month: filters.selectedMonth, monthDisplay: filters.selectedMonth })
          success++
        } catch { /* already exists */ }
      }
      toast.success(`Generated ${success} invoice(s)!`, { id: 'gen-all' })
      await loadInvoices(filters.selectedMonth)
    } catch { toast.error('Failed', { id: 'gen-all' }) }
    finally { setGenerating(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 h-6 w-6" /></div>

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Billing & Utilities</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{filters.selectedMonth} billing cycle</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 h-9">
            <input type="month" value={filters.selectedMonth}
              onChange={(e) => filters.setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm outline-none text-foreground" />
          </div>
          <span className="text-xs bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            {stats.saved} Saved
          </span>
          <span className="text-xs bg-secondary text-muted-foreground border border-border px-2.5 py-1 rounded-full font-medium">
            {stats.todo} Pending
          </span>
          <Button size="sm" onClick={handleGenerateAll} disabled={generating || stats.saved === 0}
            className="h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium">
            {generating ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
            Generate All ({stats.saved})
          </Button>
        </div>
      </div>

      {/* Bulk Meter Entry Table */}
      <form onSubmit={handleSaveAll}>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Meter Readings</h2>
            <Button type="submit" size="sm" disabled={submitting}
              className="h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs">
              {submitting ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
              Save All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Room</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tenant</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> Elec Prev</span>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> Elec Curr</span>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500" /> Water Prev</span>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500" /> Water Curr</span>
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Est. Total</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room, i) => {
                  const data = meterData[room.id]
                  if (!data) return null
                  const elecUsage = data.electricity.current ? Math.max(0, parseFloat(data.electricity.current) - data.electricity.previous) : 0
                  const waterUsage = data.water.current ? Math.max(0, parseFloat(data.water.current) - data.water.previous) : 0
                  const total = (room.pricePerMonth ?? 0) + elecUsage * rates.elec + waterUsage * rates.water
                  const hasValues = !!data.electricity.current && !!data.water.current

                  return (
                    <tr key={room.id} className={cn("border-b border-border last:border-0 hover:bg-secondary/30 transition-colors", room.isSaved && "bg-emerald-500/5")}>
                      <td className="px-4 py-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#3b82f6' }}>
                          {room.number}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {(room as any).currentTenant ? `${(room as any).currentTenant.firstName} ${(room as any).currentTenant.lastName}` : '—'}
                      </td>
                      {/* Elec Prev */}
                      <td className="px-4 py-3 w-28">
                        <input type="number" value={data.electricity.previous} readOnly
                          className="w-24 h-8 rounded-lg border border-border bg-secondary text-sm text-center text-muted-foreground outline-none px-2" />
                      </td>
                      {/* Elec Curr */}
                      <td className="px-4 py-3 w-28">
                        <input type="number" value={data.electricity.current}
                          onChange={e => actions.updateMeter(room.id, 'electricity', e.target.value)}
                          placeholder="—"
                          className="w-24 h-8 rounded-lg border border-amber-300 bg-amber-50/50 text-sm text-center outline-none px-2 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors" />
                      </td>
                      {/* Water Prev */}
                      <td className="px-4 py-3 w-28">
                        <input type="number" value={data.water.previous} readOnly
                          className="w-24 h-8 rounded-lg border border-border bg-secondary text-sm text-center text-muted-foreground outline-none px-2" />
                      </td>
                      {/* Water Curr */}
                      <td className="px-4 py-3 w-28">
                        <input type="number" value={data.water.current}
                          onChange={e => actions.updateMeter(room.id, 'water', e.target.value)}
                          placeholder="—"
                          className="w-24 h-8 rounded-lg border border-blue-300 bg-blue-50/50 text-sm text-center outline-none px-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-colors" />
                      </td>
                      {/* Total */}
                      <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                        {hasValues ? formatCurrency(total) : '—'}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {room.isSaved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle className="h-3 w-3" /> Saved
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </form>

      {/* Invoice Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Invoices — {filters.selectedMonth}</h2>
          <span className="text-xs text-muted-foreground">{invoices.length} invoice(s)</span>
        </div>
        <div className="overflow-x-auto">
          {invLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 h-5 w-5" /></div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">No invoices for this month — generate them above</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  {['Room', 'Tenant', 'Base Rent', 'Electricity', 'Water', 'Total', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#3b82f6' }}>
                        {inv.lease?.room?.number ?? '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {inv.lease?.tenant ? `${inv.lease.tenant.firstName} ${inv.lease.tenant.lastName}` : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{formatCurrency(inv.baseRent)}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Zap className="h-3 w-3 text-amber-500" />{formatCurrency(inv.electricityCost)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Droplets className="h-3 w-3 text-blue-500" />{formatCurrency(inv.waterCost)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-foreground">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", invStatusStyle[inv.status] ?? invStatusStyle.UNPAID)}>
                        {invStatusLabel[inv.status] ?? inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
