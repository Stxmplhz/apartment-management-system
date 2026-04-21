import { useState, useEffect, useMemo, useCallback } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { Payment, PaymentStatus } from "@/lib/types"

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    
    // Filter States
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
    const [floorFilter, setFloorFilter] = useState("all")
    const [sortBy, setSortBy] = useState("newest") 
    
    // Action States
    const [dragActive, setDragActive] = useState<string | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const loadPayments = async () => {
        try {
        setLoading(true)
        const data = await api.payments.list()
        setPayments(data)
        } catch (error) {
        console.error('Failed to load payments:', error)
        toast.error('Failed to load payments')
        } finally {
        setLoading(false)
        }
    }

    useEffect(() => { loadPayments() }, [])

    const processedPayments = useMemo(() => {
        return payments
            .filter(p => p && p.id)
            .filter(p => {
                const roomNum = p.invoice?.lease?.room?.number || ""
                const tenantName = p.tenant?.firstName || ""
                const floor = p.invoice?.lease?.room?.floor?.toString() || ""

                const matchesSearch = roomNum.includes(searchQuery) || tenantName.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesStatus = statusFilter === 'all' || p.status === statusFilter
                const matchesFloor = floorFilter === 'all' || floor === floorFilter
                
                return matchesSearch && matchesStatus && matchesFloor
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                const roomA = a.invoice?.lease?.room?.number || ""
                const roomB = b.invoice?.lease?.room?.number || ""
                return roomA.localeCompare(roomB, undefined, { numeric: true })
        })
    }, [payments, searchQuery, statusFilter, floorFilter, sortBy])

    const uniqueFloors = useMemo(() => 
        [...new Set(payments.map(p => p.invoice?.lease?.room?.floor))].filter(Boolean).sort()
    , [payments])

    const stats = useMemo(() => ({
        total: payments.length,
        pending: payments.filter(p => p.status === 'PENDING').length,
        paid: payments.filter(p => p.status === 'PAID').length,
        rejected: payments.filter(p => p.status === 'REJECTED').length,
    }), [payments])

    // --- Actions ---
    const handleStatusChange = async (paymentId: string, status: PaymentStatus) => {
        try {
        setProcessingId(paymentId)
        await api.payments.verify(paymentId, status) 
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status } : p))
        toast.success(status === 'PAID' ? 'Payment Approved!' : 'Payment Rejected')
        } catch (error) {
        toast.error('Failed to update payment status')
        } finally {
        setProcessingId(null)
        }
    }

    const handleDrag = useCallback((e: React.DragEvent, paymentId: string | null) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(paymentId)
        else if (e.type === "dragleave") setDragActive(null)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent, paymentId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(null)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        const url = URL.createObjectURL(file)
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, slipUrl: url } : p))
        }
    }, [])

    const handleFileUpload = (paymentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        const url = URL.createObjectURL(file)
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, slipUrl: url } : p))
        }
    }

    return {
        processedPayments, loading, stats, uniqueFloors, dragActive, processingId,
        filters: { searchQuery, setSearchQuery, statusFilter, setStatusFilter, floorFilter, setFloorFilter, sortBy, setSortBy },
        actions: { handleStatusChange, handleDrag, handleDrop, handleFileUpload }
    }
}