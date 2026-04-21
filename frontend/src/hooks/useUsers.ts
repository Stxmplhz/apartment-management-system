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

    return {
        filteredUsers, loading, searchQuery, setSearchQuery,
        actions: { refresh: loadAllUsers }
    }
}