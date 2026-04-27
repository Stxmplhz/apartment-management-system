import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  X, ImageIcon, Calendar, User, CreditCard, Phone, 
  Fingerprint, Hourglass, ExternalLink, Download,
  FileText, ShieldAlert, Trash2, Loader2 
} from "lucide-react";
import { formatCurrency, formatDateEng, getImageUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Portal } from "@/components/ui/portal";

export function LeaseDetailModal({ lease, onClose, onRefresh, getLeaseAge }: any) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [terminating, setTerminating] = useState(false);

  const handleTerminate = async () => {
    try {
      setTerminating(true);
      await api.leases.terminate(lease.id);
      toast.success("Agreement terminated successfully");
      setIsConfirmOpen(false);
      onClose();
      onRefresh();
    } catch {
      toast.error("Error in termination process");
    } finally {
      setTerminating(false);
    }
  };

  const handleDownload = async () => {
    const url = getImageUrl(lease.contractUrl);
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      // Set filename based on room number and lease ID
      const fileName = `Contract_Room_${lease.room.number}_${lease.id.slice(-6)}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: if fetch fails, open in new tab
      window.open(url, '_blank');
    }
  };

  const infoRows = [
    { icon: Calendar, label: "Commencement", value: formatDateEng(lease.startDate) },
    { icon: Calendar, label: "Expiration", value: lease.endDate ? formatDateEng(lease.endDate) : "Indefinite" },
    { icon: CreditCard, label: "Base Monthly Rent", value: formatCurrency(lease.agreedBaseRent), accent: true },
    { icon: User, label: "Tenant Name", value: `${lease.tenant.firstName} ${lease.tenant.lastName}` },
    { icon: Phone, label: "Phone", value: lease.tenant.phone },
    { icon: Fingerprint, label: "National ID", value: lease.tenant.nationalId },
  ];

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-xl border border-border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center font-medium text-sm text-white flex-shrink-0" style={{ background: '#3b82f6' }}>
                {lease.room.number}
              </div>
              <div>
                <h2 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Contract Details</h2>
                <p className="text-[11px] text-muted-foreground">ID: {lease.id.slice(-8)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Left: Info */}
              <div className="space-y-4">
                {/* Duration badge */}
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="h-8 w-8 bg-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hourglass className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Duration</p>
                    <p className="text-sm font-semibold text-blue-400">{getLeaseAge(lease.startDate)}</p>
                  </div>
                </div>

                {/* Info rows */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {infoRows.map(({ icon: Icon, label, value, accent }, i) => (
                    <div key={label} className={`flex items-center gap-3 px-4 py-3 ${i < infoRows.length - 1 ? "border-b border-border" : ""}`}>
                      <div className="h-7 w-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                        <p className={`text-sm font-medium truncate ${accent ? "text-blue-400" : "text-foreground"}`}>
                          {value || "Not Set"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Document */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
                    <ImageIcon className="h-3 w-3" /> Contract Document
                  </p>
                  {lease.contractUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={handleDownload}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download PDF
                    </Button>
                  )}
                </div>

                {lease.contractUrl ? (
                  <div
                    className="border border-border rounded-xl overflow-hidden bg-secondary group relative cursor-zoom-in"
                    onClick={() => window.open(getImageUrl(lease.contractUrl).replace(/\.pdf$/i, '.jpg'), '_blank')}
                  >
                    <img
                      src={getImageUrl(lease.contractUrl).replace(/\.pdf$/i, '.jpg')}
                      className="w-full h-auto group-hover:opacity-90 transition-opacity"
                      alt="Contract Preview"
                      onError={(e: any) => { e.target.src = 'https://placehold.co/400x600?text=Preview+Not+Available'; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <span className="bg-card/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" /> View full size
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 bg-secondary/50 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No Document Attached</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-end gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={onClose}>Close</Button>
            {lease.status === 'ACTIVE' && (
              <Button size="sm" className="rounded-lg h-9 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-5"
                onClick={() => setIsConfirmOpen(true)}>
                <ShieldAlert className="h-3.5 w-3.5 mr-1.5" /> Terminate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Terminate */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Terminate Contract?</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsConfirmOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Room <span className="font-semibold text-red-400">{lease?.room?.number}</span> will be set back to{" "}
                  <span className="font-semibold text-emerald-400">VACANT</span>. This action is permanent.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-lg h-9" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                <Button disabled={terminating} size="sm"
                  className="flex-1 rounded-lg h-9 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleTerminate}>
                  {terminating ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                  Terminate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Portal>
  );
}
