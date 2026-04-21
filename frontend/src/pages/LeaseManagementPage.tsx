import { useState } from "react";
import { useLeases } from "@/hooks/useLeases";
import { LeaseCard } from "@/components/features/leases/LeaseCard";
import { LeaseFilterBar } from "@/components/features/leases/LeaseFilterBar";
import { LeaseDetailModal } from "@/components/features/leases/LeaseDetailModal";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import type { Lease } from "@/lib/types";

export default function LeaseManagementPage() {
  const { processedLeases, loading, filters, uniqueFloors, actions } = useLeases();
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading && processedLeases.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black">Lease Management</h1>
          <p className="text-sm text-slate-400 font-medium">Review active and past tenant contracts</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search..." 
            className="pl-10 h-12 rounded-2xl bg-slate-50 border-none" 
            value={filters.search} 
            onChange={(e) => filters.setSearch(e.target.value)} 
          />
        </div>
      </div>

      <LeaseFilterBar filters={filters} uniqueFloors={uniqueFloors} />

      <div className="grid gap-4">
        {processedLeases.map(lease => (
          <LeaseCard 
            key={lease.id} 
            lease={lease} 
            onOpenDetail={(l: Lease) => { setSelectedLease(l); setIsModalOpen(true); }}
          />
        ))}
      </div>

      {isModalOpen && selectedLease && (
        <LeaseDetailModal 
          lease={selectedLease} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={actions.refresh}
          getLeaseAge={actions.getLeaseAge}
        />
      )}
    </div>
  );
}