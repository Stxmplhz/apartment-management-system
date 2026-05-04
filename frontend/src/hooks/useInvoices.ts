import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Invoice, InvoiceStatus } from "@/lib/types";

export function useInvoices(selectedMonth: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [floorFilter, setFloorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.invoices.list({ month: selectedMonth });
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, [selectedMonth]);

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      setProcessingId(invoiceId);
      await api.invoices.update(invoiceId, { status: 'PAID' });
      toast.success('Invoice marked as paid');
      await loadInvoices();
    } catch (error) {
      toast.error('Failed to update invoice');
    } finally {
      setProcessingId(null);
    }
  };

  const processedInvoices = useMemo(() => {
    return invoices
      .filter(inv => {
        const matchesSearch = inv.lease?.room?.number?.includes(searchQuery) || 
                            inv.lease?.tenant?.firstName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
        const matchesFloor = floorFilter === "all" || inv.lease?.room?.floor?.toString() === floorFilter;
        return matchesSearch && matchesStatus && matchesFloor;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return (a.lease?.room?.number || "").localeCompare(b.lease?.room?.number || "", undefined, {numeric: true});
      });
  }, [invoices, searchQuery, statusFilter, floorFilter, sortBy]);

  const stats = useMemo(() => ({
    pending: invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').length,
    totalAmount: invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').reduce((acc, i) => acc + i.totalAmount, 0),
    uniqueFloors: [...new Set(invoices.map(i => i.lease?.room?.floor))].filter(Boolean).sort()
  }), [invoices]);

  const handleGenerateAll = async () => {
    try {
      setLoading(true);
      const res = await api.invoices.generateAll({ 
        month: selectedMonth,
        monthDisplay: new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
      
      if (res.success) {
        toast.success(`Success! Created: ${res.summary.created}, Skipped: ${res.summary.skipped}`);
        if (res.summary.errors > 0) toast.error(`${res.summary.errors} errors occurred`);
        await loadInvoices();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOverdue = async () => {
    try {
      setLoading(true);
      const res = await api.invoices.syncOverdue();
      if (res.success) {
        toast.success(`Success! Updated ${res.updatedCount} invoices to Overdue.`);
        await loadInvoices();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync overdue status');
    } finally {
      setLoading(false);
    }
  };

  return {
    processedInvoices, loading, stats, processingId,
    filters: { searchQuery, setSearchQuery, statusFilter, setStatusFilter, floorFilter, setFloorFilter, sortBy, setSortBy },
    actions: { handleMarkPaid, handleGenerateAll, handleSyncOverdue, refresh: loadInvoices }
  };
}