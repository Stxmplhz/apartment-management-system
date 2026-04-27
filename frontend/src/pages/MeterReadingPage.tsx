import { useState, useEffect } from "react"
import { useMeters } from "@/hooks/useMeters"
import { useInvoices } from "@/hooks/useInvoices"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatCurrency } from "@/lib/utils"
import { Loader2, CheckCircle, Zap, Droplets, Search } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"

const statusStyle: Record<string, string> = {
  PAID:           "bg-emerald-50 text-emerald-600 border-emerald-100",
  UNPAID:         "bg-amber-50  text-amber-600  border-amber-100",
  PENDING_VERIFY: "bg-blue-50   text-blue-600   border-blue-100",
  OVERDUE:        "bg-red-50    text-red-600    border-red-100",
}
const statusLabel: Record<string, string> = {
  PAID: "Paid", UNPAID: "Unpaid", PENDING_VERIFY: "Pending", OVERDUE: "Overdue"
}

export default function MeterReadingPage() {
  const { filteredRooms, meterData, loading, submitting, uniqueFloors, stats, rates, filters, actions } = useMeters()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const { processedInvoices, loading: invLoading } = useInvoices(selectedMonth)

  // Form state for single-room entry (left panel)
  const [selectedRoomId, setSelectedRoomId] = useState("")
  const [elecPrev, setElecPrev] = useState("")
  const [elecCurr, setElecCurr] = useState("")
  const [waterPrev, setWaterPrev] = useState("")
  const [waterCurr, setWaterCurr] = useState("")
  const [generating, setGenerating] = useState(false)

  // Sync form when room selected
  useEffect(() => {
    if (!selectedRoomId || !meterData[selectedRoomId]) {
      setElecPrev(""); setElecCurr(""); setWaterPrev(""); setWaterCurr("")
      return
    }
    const d = meterData[selectedRoomId]
    setElecPrev(d.electricity.previous.toString())
    setElecCurr(d.electricity.current)
    setWaterPrev(d.water.previous.toString())
    setWaterCurr(d.water.current)
  }, [selectedRoomId, meterData])

  const elecUsage = elecCurr && elecPrev ? Math.max(0, parseFloat(elecCurr) - parseFloat(elecPrev)) : 0
  const waterUsage = waterCurr && waterPrev ? Math.max(0, parseFloat(waterCurr) - parseFloat(waterPrev)) : 0
  const elecCost = elecUsage * rates.elec
  const waterCost = waterUsage * rates.water
  const selectedRoom = filteredRooms.find(r => r.id === selectedRoomId)
  const baseRent = selectedRoom?.pricePerMonth ?? 0
  const total = elecCost + waterCost + baseRent

  const handleGenerate = async () => {
    if (!selectedRoomId) return toast.error("Please select a room")
    if (!elecCurr || !waterCurr) return toast.error("Please enter meter readings")
    try {
      setGenerating(true)
      actions.updateMeter(selectedRoomId, 'electricity', elecCurr)
      actions.updateMeter(selectedRoomId, 'water', waterCurr)
      await api.meters.bulkCreate({
        roomId: selectedRoomId, month: filters.selectedMonth,
        electricity: { previousValue: parseFloat(elecPrev), currentValue: parseFloat(elecCurr), rateAtTime: rates.elec },
        water: { previousValue: parseFloat(waterPrev), currentValue: parseFloat(waterCurr), rateAtTime: rates.water }
      })
      await api.invoices.generate({ roomId: selectedRoomId, month: filters.selectedMonth, monthDisplay: filters.selectedMonth })
      toast.success("Invoice generated!")
      setSelectedRoomId(""); setElecCurr(""); setWaterCurr("")
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate invoice")
    } finally { setGenerating(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 h-6 w-6" /></div>

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Billing &amp; Utilities</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{filters.selectedMonth.replace('-', ' ')} billing cycle</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 h-9">
            <input type="month" value={filters.selectedMonth} onChange={(e) => { filters.setSelectedMonth(e.target.value); setSelectedMonth(e.target.value) }} className="bg-transparent text-sm outline-none text-foreground" />
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">{stats.saved} Saved</span>
          <span className="text-xs bg-secondary text-muted-foreground border border-border px-2.5 py-1 rounded-full font-medium">{stats.todo} To Do</span>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT — Meter Entry */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>⚡ Meter Reading Entry</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Room + Month */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Room Number</label>
                <select
                  className="w-full h-9 rounded-lg border border-border bg-secondary text-sm text-foreground px-3 outline-none focus:border-blue-400 transition-colors"
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                >
                  <option value="">Select room...</option>
                  {filteredRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.number}{r.currentTenant ? ` – ${r.currentTenant.firstName} ${r.currentTenant.lastName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Billing Month</label>
                <input
                  type="month"
                  value={filters.selectedMonth}
                  onChange={(e) => { filters.setSelectedMonth(e.target.value); setSelectedMonth(e.target.value) }}
                  className="w-full h-9 rounded-lg border border-border bg-secondary text-sm text-foreground px-3 outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            </div>

            {/* Water */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500" /> Water — Previous (m³)</label>
                <Input type="number" value={elecPrev ? waterPrev : ""} onChange={e => setWaterPrev(e.target.value)} placeholder="0" className="h-9 rounded-lg bg-secondary border-border text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500" /> Water — Current (m³)</label>
                <Input type="number" value={waterCurr} onChange={e => setWaterCurr(e.target.value)} placeholder="0" className="h-9 rounded-lg border-border text-sm focus-visible:ring-blue-400" />
              </div>
            </div>

            {/* Electricity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> Electric — Previous (kWh)</label>
                <Input type="number" value={elecPrev} onChange={e => setElecPrev(e.target.value)} placeholder="0" className="h-9 rounded-lg bg-secondary border-border text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> Electric — Current (kWh)</label>
                <Input type="number" value={elecCurr} onChange={e => setElecCurr(e.target.value)} placeholder="0" className="h-9 rounded-lg border-border text-sm focus-visible:ring-amber-400" />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-secondary border border-border rounded-lg p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Water usage ({waterUsage} m³ × ฿{rates.water})</span>
                <span className="font-medium text-foreground">{formatCurrency(waterCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Electric usage ({elecUsage} kWh × ฿{rates.elec})</span>
                <span className="font-medium text-foreground">{formatCurrency(elecCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base rent</span>
                <span className="font-medium text-foreground">{formatCurrency(baseRent)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total Invoice</span>
                <span className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Syne, sans-serif' }}>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={generating || !selectedRoomId} className="flex-1 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                {generating ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
                Generate Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT — Recent Invoices */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Invoices</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-7 h-7 w-36 rounded-md bg-secondary border-border text-xs" />
            </div>
          </div>
          <div className="overflow-x-auto">
            {invLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 h-5 w-5" /></div>
            ) : processedInvoices.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No invoices for this month</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Room</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Month</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processedInvoices.map((inv, i) => (
                    <tr key={inv.id} className={cn("border-b border-border last:border-0 hover:bg-secondary/50 transition-colors", i % 2 === 0 ? "" : "bg-secondary/20")}>
                      <td className="px-5 py-3 text-sm font-semibold text-foreground">{inv.lease?.room?.number ?? '—'}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{inv.month}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-foreground">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-5 py-3">
                        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", statusStyle[inv.status] ?? statusStyle.UNPAID)}>
                          {statusLabel[inv.status] ?? inv.status}
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

    </div>
  )
}
