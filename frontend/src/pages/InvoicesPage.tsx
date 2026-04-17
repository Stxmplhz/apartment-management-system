import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { PaymentSlipUpload } from "@/components/PaymentSlipUpload"
import { cn, formatCurrency } from "@/lib/utils"
import { Download, CheckCircle, Zap, Droplets, FileText, Loader2, Upload } from "lucide-react"
import type { Invoice, InvoiceStatus } from "@/lib/types"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all')
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      const data = await api.invoices.list()
      setInvoices(data)
    } catch (error) {
      console.error('Failed to load invoices:', error)
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
    const elecUsage = invoice.electricityUsage || (invoice.electricityCost / 4.5);
    const waterUsage = invoice.waterUsage || (invoice.waterCost / 18);

    const formatPDFCurrency = (amount: number) => `THB ${new Intl.NumberFormat('th-TH').format(amount || 0)}`;

    const lease = invoice.lease;
    const tenant = lease?.tenant;
    const room = lease?.room;
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">View and manage monthly billing invoices</p>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Pending Amount</p>
          <p className="text-xl font-semibold">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              filter === f.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Invoice Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInvoices.map(invoice => (
          <div key={invoice.id} className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <div>
                <h3 className="font-semibold">Room {invoice.room?.number}</h3>
                <p className="text-sm text-muted-foreground">{invoice.tenantName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{invoice.month}</p>
                <span className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1",
                  invoice.status === 'PAID'
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-amber-500/15 text-amber-500"
                )}>
                  {invoice.status === 'PAID' && <CheckCircle className="h-3 w-3" />}
                  {invoice.status === 'PAID' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Base Rent</span>
                <span className="font-medium">{formatCurrency(invoice.baseRent)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Electricity
                  <span className="text-xs opacity-60">{invoice.electricityUsage} kWh</span>
                </span>
                <span className="font-medium">{formatCurrency(invoice.electricityCost)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" />
                  Water
                  <span className="text-xs opacity-60">{invoice.waterUsage} units</span>
                </span>
                <span className="font-medium">{formatCurrency(invoice.waterCost)}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold">{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 pt-0">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 h-9 rounded-lg"
                onClick={() => handleDownload(invoice)}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>
              {user?.role === 'ADMIN' && invoice.status === 'UNPAID' && (
                <Button 
                  size="sm"
                  className="flex-1 h-9 rounded-lg"
                  onClick={() => handleMarkPaid(invoice.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Mark Paid
                </Button>
              )}
              {user?.role === 'TENANT' && (invoice.status === 'UNPAID' || invoice.status === 'PENDING_VERIFY') && (
                <Button 
                  size="sm"
                  className="flex-1 h-9 rounded-lg"
                  onClick={() => {
                    setSelectedInvoice(invoice)
                    setSlipDialogOpen(true)
                  }}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload Proof
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No invoices found</h3>
          <p className="text-sm text-muted-foreground">No invoices match the selected filter</p>
        </div>
      )}

      {/* Payment Slip Upload Dialog */}
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
