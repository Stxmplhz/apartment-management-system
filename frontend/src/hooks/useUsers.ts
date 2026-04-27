import { useState, useEffect, useMemo } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function useUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const loadAllUsers = async () => {
        try {
        setLoading(true)
        const data = await api.users.list()
        setUsers(data)
        } catch (error) { 
        toast.error("Failed to fetch users") 
        } finally { 
        setLoading(false) 
        }
    }

    useEffect(() => { loadAllUsers() }, [])

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
        const searchTarget = `
            ${u.email} 
            ${u.tenantProfile?.firstName || ''} 
            ${u.tenantProfile?.lastName || ''}
            ${u.techProfile?.firstName || ''}
        `.toLowerCase()
        return searchTarget.includes(searchQuery.toLowerCase())
        })
    }, [users, searchQuery])

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            await api.users.toggleStatus(id, !current)
            toast.success("Status updated")
            loadAllUsers()
        } catch { toast.error("Update failed") }
    }

    const changeRole = async (id: string, role: string) => {
        try {
            await api.users.changeRole(id, role)
            toast.success("Role updated")
            loadAllUsers()
        } catch { toast.error("Update failed") }
    }

    const resetPassword = async (id: string, pass: string) => {
        try {
            await api.users.resetPassword(id, pass)
            toast.success("Password reset successfully")
            loadAllUsers()
        } catch { toast.error("Reset failed") }
    }

    return {
        filteredUsers, loading, searchQuery, setSearchQuery,
        actions: { 
            refresh: loadAllUsers,
            toggleStatus,
            changeRole,
            resetPassword
        }
    }
}