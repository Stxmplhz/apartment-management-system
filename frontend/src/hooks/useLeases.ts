import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useLeases() {
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const loadLeases = async () => {
    try {
      setLoading(true);
      const data = await api.leases.list();
      setLeases(data);
    } catch (e) { toast.error("Failed to load leases"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadLeases(); }, []);

  const getLeaseAge = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    if (start > now) return `Starting in ${Math.ceil((start.getTime() - now.getTime()) / 86400000)} days`;
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) { years -= 1; months += 12; }
    
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    return parts.length > 0 ? parts.join(' ') : "Joined today";
  };

  const processedLeases = useMemo(() => {
    return leases
      .filter((l: any) => {
        const matchesSearch = l.room.number.includes(search) || l.tenant.firstName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || l.status === statusFilter;
        const matchesFloor = floorFilter === "all" || l.room.floor.toString() === floorFilter;
        return matchesSearch && matchesStatus && matchesFloor;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "newest") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        if (sortBy === "expiring") return (new Date(a.endDate || 0).getTime()) - (new Date(b.endDate || 0).getTime());
        return a.room.number.localeCompare(b.room.number, undefined, { numeric: true });
      });
  }, [leases, search, statusFilter, floorFilter, sortBy]);

  const uniqueFloors = useMemo(() => 
    [...new Set(leases.map((l: any) => l.room.floor))].sort()
  , [leases]);

  return {
    processedLeases, loading, uniqueFloors,
    filters: { search, setSearch, statusFilter, setStatusFilter, floorFilter, setFloorFilter, sortBy, setSortBy },
    actions: { refresh: loadLeases, getLeaseAge }
  };
}