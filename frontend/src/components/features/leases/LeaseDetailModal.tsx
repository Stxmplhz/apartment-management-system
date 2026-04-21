import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetailItem } from "@/components/shared/DetailItem";
import { 
  X, ImageIcon, Calendar, User, CreditCard, Phone, 
  Fingerprint, Hourglass, ShieldCheck, ExternalLink, 
  FileText, ShieldAlert, Trash2, Loader2 
} from "lucide-react";
import { formatCurrency, formatDateEng, getImageUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
    } catch (e) { 
      toast.error("Error in termination process"); 
    } finally { 
      setTerminating(false); 
    }
  };

  return (
    <>
      {/* --- Main Detail Modal --- */}
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
          
          <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl">{lease.room.number}</div>
              <div>
                <h2 className="text-2xl font-black">Contract Details</h2>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">ID: {lease.id.slice(-8)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" onClick={onClose}><X className="h-6 w-6" /></Button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Left Column: Info */}
              <div className="space-y-8">
                <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                  <Hourglass className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Duration</p>
                    <p className="text-xl font-black text-blue-700">{getLeaseAge(lease.startDate)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Contractual Terms</h3>
                  <div className="grid gap-3">
                    <DetailItem icon={<Calendar />} label="Commencement" value={formatDateEng(lease.startDate)} />
                    <DetailItem icon={<Calendar />} label="Expiriation" value={lease.endDate ? formatDateEng(lease.endDate) : "Indefinite"} />
                    <DetailItem icon={<CreditCard />} label="Base Monthly Rent" value={formatCurrency(lease.agreedBaseRent)} highlight />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2"><User className="h-4 w-4" /> Tenant Information</h3>
                  <div className="grid gap-3">
                    <DetailItem icon={<User />} label="Name" value={`${lease.tenant.firstName} ${lease.tenant.lastName}`} />
                    <DetailItem icon={<Phone />} label="Phone" value={lease.tenant.phone} />
                    <DetailItem icon={<Fingerprint />} label="National ID" value={lease.tenant.nationalId} />
                  </div>
                </div>
              </div>

              {/* Right Column: Document Preview */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Contract Document
                </h3>

                {lease.contractUrl ? (
                  <div className="h-[450px] border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center p-2 shadow-inner relative overflow-hidden">
                    <div 
                      className="relative h-full w-full group cursor-zoom-in"
                      onClick={() => {
                        const safeJpgUrl = getImageUrl(lease.contractUrl).replace(/\.pdf$/i, '.jpg');
                        window.open(safeJpgUrl, '_blank');
                      }}
                    >
                      <img 
                        src={getImageUrl(lease.contractUrl).replace(/\.pdf$/i, '.jpg')} 
                        className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]" 
                        alt="Contract Preview"
                        onError={(e: any) => { e.target.src = 'https://placehold.co/400x600?text=Preview+Not+Available'; }}
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase">Open as Image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-300">
                    <FileText className="h-16 w-16 mb-2 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">No Document Attached</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3 rounded-b-[2.5rem]">
            <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold" onClick={onClose}>Close Window</Button>
            {lease.status === 'ACTIVE' && (
              <Button variant="destructive" className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-red-100" onClick={() => setIsConfirmOpen(true)}>
                Terminate Agreement
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- Confirm Terminate Modal (Nested State) --- */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-4">
                 <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-50">
                    <ShieldAlert className="h-10 w-10" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Cancel Contract?</h2>
                    <p className="text-sm text-slate-500 font-medium">This will set Room <span className="font-black text-red-600">{lease?.room?.number}</span> back to <span className="font-bold text-emerald-600">VACANT</span>. This action is permanent.</p>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <Button disabled={terminating} variant="destructive" className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-red-200" onClick={handleTerminate}>
                    {terminating ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2 h-5 w-5" />}
                    Terminate Now
                 </Button>
                 <Button variant="ghost" className="h-12 rounded-2xl font-bold text-slate-400 hover:text-slate-600" onClick={() => setIsConfirmOpen(false)}>
                    Go Back
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </>
  );
}