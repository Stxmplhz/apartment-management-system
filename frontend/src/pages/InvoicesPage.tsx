// @ts-nocheck
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PaymentSlipUpload } from "@/components/PaymentSlipUpload"
import { cn, formatCurrency, formatMonthName } from "@/lib/utils"
import { Calendar, Download, Zap, Droplets, Loader2, Search, Receipt, CheckCircle2, AlertCircle } from "lucide-react"
import type { Invoice, InvoiceStatus } from "@/lib/types"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { WATER_RATE, ELECTRICITY_RATE } from "@/lib/constants"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all')
  const [floorFilter, setFloorFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const [slipDialogOpen, setSlipDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [selectedMonth])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await api.invoices.list({ month: selectedMonth })
      setInvoices(data)
    } catch (error) {
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const processedInvoices = invoices
    .filter(inv => {
      const matchesSearch = inv.lease?.room?.number?.includes(searchQuery) || 
                            inv.lease?.tenant?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter
      const matchesFloor = floorFilter === "all" || inv.lease?.room?.floor?.toString() === floorFilter
      return matchesSearch && matchesStatus && matchesFloor
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return (a.lease?.room?.number || "").localeCompare(b.lease?.room?.number || "", undefined, {numeric: true})
    })

  const uniqueFloors = [...new Set(invoices.map(i => i.lease?.room?.floor))].filter(Boolean).sort()

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').length, 
    paid: invoices.filter(i => i.status === 'PAID').length,
    totalAmount: invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').reduce((acc, i) => acc + i.totalAmount, 0),
  }

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      setProcessingId(invoiceId)
      await api.invoices.update(invoiceId, { status: 'PAID' })
      toast.success('Invoice marked as paid')
      loadInvoices()
    } catch (error) {
      toast.error('Failed to update invoice')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDownload = (invoice: any) => {
    const doc = new jsPDF();
    const elecUsage = invoice.electricityUsage || (invoice.electricityCost / ELECTRICITY_RATE);
    const waterUsage = invoice.waterUsage || (invoice.waterCost / WATER_RATE);

    const formatPDFCurrency = (amount: number) => `THB ${new Intl.NumberFormat('th-TH').format(amount || 0)}`;
    const tenant = invoice.lease?.tenant;
    const room = invoice.lease?.room;
    const tName = tenant ? `${tenant.firstName} ${tenant.lastName}` : "Unknown Tenant";
    const rNum = room?.number || "N/A";

    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 105, 20, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoice.invoiceNumber || invoice.id?.slice(-8)}`, 14, 35);
    doc.text(`Name: ${tName}`, 14, 67);
    doc.text(`Room: Room ${rNum}`, 14, 72);

    const tableData = [
      ["Base Rent", "-", formatPDFCurrency(invoice.baseRent)],
      ["Electricity", `${elecUsage.toFixed(2)} kWh`, formatPDFCurrency(invoice.electricityCost)],
      ["Water", `${waterUsage.toFixed(2)} units`, formatPDFCurrency(invoice.waterCost)],
    ];

    autoTable(doc, {
      startY: 80,
      head: [["Description", "Details", "Amount"]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatPDFCurrency(invoice.totalAmount)}`, 196, finalY, { align: "right" });
    doc.save(`Invoice-${rNum}-${invoice.month}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID': return 'bg-red-100 text-red-700 border-red-200'
      case 'OVERDUE': return 'bg-red-500 text-white border-red-600 shadow-md'
      case 'PENDING_VERIFY': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  if (loading && invoices.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground text-sm font-medium text-slate-400">
            Unpaid this month: <span className="text-red-500 font-bold">{stats.pending} rooms</span> 
            <span className="mx-2">•</span> 
            Total Due: <span className="text-slate-700 font-bold">{formatCurrency(stats.totalAmount)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search room or tenant..." 
              className="pl-10 h-12 rounded-2xl bg-slate-50 border-none font-medium focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bg-slate-50 rounded-2xl flex items-center px-3 h-12">
            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
            <Input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              className="border-none bg-transparent h-8 w-32 focus-visible:ring-0 font-bold p-0 text-sm text-slate-700" 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
           <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
            {['all', 'UNPAID', 'PENDING_VERIFY', 'PAID'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                  statusFilter === s ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {s === 'all' ? 'All Bills' : s === 'UNPAID' ? 'Not Paid' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <select 
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="h-9 px-4 rounded-xl bg-slate-100 border-none text-[10px] font-black uppercase text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">All Floors</option>
            {uniqueFloors.map(f => <option key={f} value={f.toString()}>Floor {f}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
           <select 
             value={sortBy} 
             onChange={(e) => setSortBy(e.target.value)} 
             className="h-7 px-3 rounded-lg bg-transparent border-none text-[10px] font-black uppercase text-slate-600 focus:ring-0 outline-none cursor-pointer"
           >
             <option value="newest">Latest Bills</option>
             <option value="oldest">Oldest Bills</option>
             <option value="room">By Room #</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedInvoices.map(invoice => {
          const elecUsage = invoice.electricityUsage || (invoice.electricityCost / ELECTRICITY_RATE);
          const waterUsage = invoice.waterUsage || (invoice.waterCost / WATER_RATE);

          return (
            <Card key={invoice.id} className="rounded-[2rem] border-none shadow-md bg-white overflow-hidden hover:shadow-xl transition-all group flex flex-col">
              
              <div className="px-6 py-5 border-b bg-slate-50/50 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                   <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex flex-col items-center justify-center font-black">
                     <span className="text-[8px] opacity-60 uppercase leading-none">Room</span>
                     <span className="text-lg leading-tight">{invoice.lease?.room?.number}</span>
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-900">{invoice.lease?.tenant?.firstName} {invoice.lease?.tenant?.lastName}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatMonthName(invoice.month)}</p>
                   </div>
                </div>
                <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border", getStatusColor(invoice.status))}>
                  {invoice.status === 'PENDING_VERIFY' ? 'Checking' : invoice.status}
                </span>
              </div>
              
              <div className="p-6 space-y-3 text-sm flex-1">
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                   <span className="text-slate-500 font-medium">Base Rent</span>
                   <span className="font-bold text-slate-700">{formatCurrency(invoice.baseRent)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                  <span className="flex items-center gap-1.5 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-lg text-xs">
                     <Zap className="h-3 w-3"/> Elec ({elecUsage.toFixed(0)} u)
                  </span>
                  <span className="font-bold text-slate-700">{formatCurrency(invoice.electricityCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                  <span className="flex items-center gap-1.5 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-lg text-xs">
                     <Droplets className="h-3 w-3"/> Water ({waterUsage.toFixed(0)} u)
                  </span>
                  <span className="font-bold text-slate-700">{formatCurrency(invoice.waterCost)}</span>
                </div>
                
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Due</span>
                  <span className="text-2xl font-black text-blue-600">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 flex gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-xl flex-1 bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-100" 
                  onClick={() => handleDownload(invoice)}
                >
                  <Download className="h-4 w-4 mr-2"/> PDF Bill
                </Button>

                {user?.role === 'ADMIN' && invoice.status === 'UNPAID' && (
                  <Button 
                    className="rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200" 
                    onClick={() => handleMarkPaid(invoice.id)}
                    disabled={processingId === invoice.id}
                  >
                    {processingId === invoice.id ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 mr-2"/>}
                    Mark Paid
                  </Button>
                )}

                {user?.role === 'TENANT' && (invoice.status === 'UNPAID' || invoice.status === 'PENDING_VERIFY') && (
                  <Button 
                    className="rounded-xl flex-1 bg-slate-900 hover:bg-black text-white font-bold" 
                    onClick={() => { setSelectedInvoice(invoice); setSlipDialogOpen(true); }}
                  >
                    <Upload className="h-4 w-4 mr-2"/> 
                    {invoice.status === 'UNPAID' ? 'Pay Now' : 'Re-Upload'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {processedInvoices.length === 0 && (
        <div className="text-center py-32 bg-slate-50 border-2 border-dashed rounded-[3rem]">
          <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="font-black text-slate-300 uppercase tracking-widest text-sm">No bills match your filters</p>
        </div>
      )}

      {selectedInvoice && (
        <PaymentSlipUpload 
          invoice={selectedInvoice} 
          open={slipDialogOpen} 
          onOpenChange={setSlipDialogOpen} 
          onSuccess={loadInvoices} 
        />
      )}
    </div>
  )
}