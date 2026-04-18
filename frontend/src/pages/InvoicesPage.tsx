import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaymentSlipUpload } from "@/components/PaymentSlipUpload"
import { cn, formatCurrency } from "@/lib/utils"
import { Calendar, Download, Zap, Droplets, Loader2 } from "lucide-react"
import type { Invoice, InvoiceStatus } from "@/lib/types"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { WATER_RATE, ELECTRICITY_RATE } from "@/lib/constants"
import { formatMonthForAPI } from "@/lib/utils"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all')
  const [selectedMonth, setSelectedMonth] = useState("")

  const [slipDialogOpen, setSlipDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [selectedMonth])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const apiMonth = formatMonthForAPI(selectedMonth);
      const data = await api.invoices.list({ month: apiMonth })
      setInvoices(data)
    } catch (error) {
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter)

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'UNPAID').length, 
    paid: invoices.filter(i => i.status === 'PAID').length,
    totalAmount: invoices.filter(i => i.status === 'UNPAID').reduce((acc, i) => acc + i.totalAmount, 0),
  }

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await api.invoices.update(invoiceId, { status: 'PAID' })
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === invoiceId ? { ...inv, status: 'PAID' as InvoiceStatus } : inv
        )
      )
      toast.success('Invoice marked as paid')
    } catch (error) {
      console.error('Failed to update invoice:', error)
      toast.error('Failed to update invoice')
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

    // @ts-ignore
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatPDFCurrency(invoice.totalAmount)}`, 196, finalY, { align: "right" });
    doc.save(`Invoice-${rNum}-${invoice.month}.pdf`);
  };

  const filters: { value: 'all' | InvoiceStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'UNPAID', label: 'Pending', count: stats.pending }, 
    { value: 'PAID', label: 'Paid', count: stats.paid },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

return (
    <div className="space-y-8">
      {/* Header with Month Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm">Review and manage billing cycle</p>
        </div>
        <div className="flex items-center gap-2 bg-card border p-2 rounded-xl">
          <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
          <Input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-none bg-transparent h-8 w-40 focus-visible:ring-0"
          />
          {selectedMonth && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedMonth("")} className="h-8 px-2 text-xs">Clear</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} className={cn("px-3 py-1.5 text-sm font-medium rounded-md", filter === f.value ? "bg-card shadow-sm" : "text-muted-foreground")}>
            {f.label} <span className="ml-1 opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInvoices.map(invoice => {
          // ✅ คำนวณหน่วยย้อนกลับเพื่อโชว์บนหน้าเว็บ (Web UI)
          const elecUsage = invoice.electricityUsage || (invoice.electricityCost / ELECTRICITY_RATE);
          const waterUsage = invoice.waterUsage || (invoice.waterCost / WATER_RATE);

          return (
            <div key={invoice.id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b bg-secondary/10 flex justify-between">
                <div>
                  <h3 className="font-bold text-blue-600">Room {invoice.lease?.room?.number}</h3>
                  <p className="text-xs text-muted-foreground">{invoice.month}</p>
                </div>
                <span className={cn("text-xs font-bold px-2 py-1 rounded-full h-fit", invoice.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {invoice.status}
                </span>
              </div>
              
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Base Rent</span><span>{formatCurrency(invoice.baseRent)}</span></div>
                {/* ✅ แสดงค่าที่คำนวณมาแล้ว */}
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500"/> Electricity ({elecUsage.toFixed(0)} kWh)</span>
                  <span>{formatCurrency(invoice.electricityCost)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500"/> Water ({waterUsage.toFixed(0)} units)</span>
                  <span>{formatCurrency(invoice.waterCost)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 text-lg">
                  <span>Total</span><span className="text-blue-600">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleDownload(invoice)}><Download className="h-4 w-4 mr-2"/> PDF</Button>
                {user?.role === 'ADMIN' && invoice.status === 'UNPAID' && (
                  <Button className="flex-1" onClick={() => handleMarkPaid(invoice.id)}>Mark Paid</Button>
                )}
                {user?.role === 'TENANT' && (invoice.status === 'UNPAID' || invoice.status === 'PENDING_VERIFY') && (
                  <Button className="flex-1" onClick={() => { setSelectedInvoice(invoice); setSlipDialogOpen(true); }}>Upload Proof</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedInvoice && <PaymentSlipUpload invoice={selectedInvoice} open={slipDialogOpen} onOpenChange={setSlipDialogOpen} onSuccess={loadInvoices} />}
    </div>
  )
}