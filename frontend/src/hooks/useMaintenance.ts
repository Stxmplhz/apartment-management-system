import { useState, useEffect, useMemo } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { MaintenanceRequest } from "@/lib/types"
import { useAuth } from "@/contexts/AuthContext"

export function useMaintenance() {
    const { user } = useAuth()
    const userIsAdmin = user?.role === 'ADMIN'
    const userIsTechnician = user?.role === 'TECHNICIAN'
    const userIsTenant = user?.role === 'TENANT'

    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [technicians, setTechnicians] = useState<any[]>([])

    // Filters & Sorting
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [floorFilter, setFloorFilter] = useState("all")
    const [sortBy, setSortBy] = useState("newest") 

    const loadRequests = async () => {
        try {
            setLoading(true)
            const data = await api.maintenance.list()
            setRequests(data)
        } catch (error) { 
            toast.error('Failed to load requests') 
        } finally { 
            setLoading(false) 
        }
    }

    const loadTechnicians = async () => {
        try {
            const data = await api.maintenance.listTechnicians()
            setTechnicians(data) 
        } catch (error) { 
            console.error(error) 
        }
    }

    useEffect(() => {
        loadRequests()
        if (userIsAdmin) loadTechnicians()
    }, [userIsAdmin])

    const handleUpdateStatus = async (requestId: string, nextStatus: string) => {
        try {
            setLoading(true);
            await api.maintenance.updateStatus(requestId, nextStatus);
            toast.success(`Status updated to ${nextStatus}`);
            await loadRequests();
        } catch (error) { 
            toast.error('Update failed'); 
        } finally { 
            setLoading(false); 
        }
    }

    const processedRequests = useMemo(() => {
        return requests
            .filter(req => {
                const matchesSearch = req.description.toLowerCase().includes(searchQuery.toLowerCase()) || req.room?.number.includes(searchQuery)
                const matchesStatus = statusFilter === "all" || req.status === statusFilter
                const matchesFloor = floorFilter === "all" || req.room?.floor.toString() === floorFilter
                return matchesSearch && matchesStatus && matchesFloor
            })
            .sort((a, b) => {
                return sortBy === "newest" 
                    ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            })
    }, [requests, searchQuery, statusFilter, floorFilter, sortBy])

    const uniqueFloors = useMemo(() => [...new Set(requests.map(r => r.room?.floor))].filter(Boolean).sort(), [requests])

    return {
        processedRequests, loading, technicians, uniqueFloors,
        roles: { userIsAdmin, userIsTechnician, userIsTenant },
        filters: { searchQuery, setSearchQuery, statusFilter, setStatusFilter, floorFilter, setFloorFilter, sortBy, setSortBy },
        actions: { loadRequests, handleUpdateStatus }
    }
}