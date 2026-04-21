import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function useMoveIn() {
    const [availableRooms, setAvailableRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [generatedPass, setGeneratedPass] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        selectedRoom: "", email: "", name: "", phone: "", nationalId: "",
        rent: "", initElec: "0", initWater: "0",
        startDate: new Date().toISOString().split('T')[0], endDate: ""
    })
    
    const [files, setFiles] = useState<{ idFile: File | null, contractFile: File | null }>({
        idFile: null, contractFile: null
    })

    useEffect(() => {
        const loadRooms = async () => {
        try {
            const rooms = await api.rooms.list({ status: 'VACANT' })
            setAvailableRooms(rooms)
        } catch (error) { 
            toast.error('Failed to load rooms') 
        } finally { 
            setLoading(false) 
        }
        }
        loadRooms()
    }, [])

    const updateForm = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleRoomSelect = (roomId: string) => {
        const room = availableRooms.find(rm => rm.id === roomId)
        setFormData(prev => ({ 
        ...prev, 
        selectedRoom: roomId, 
        rent: room ? room.pricePerMonth.toString() : prev.rent 
        }))
    }

    const handleFileChange = (field: 'idFile' | 'contractFile', file: File) => {
        setFiles(prev => ({ ...prev, [field]: file }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!files.idFile) return toast.error("Please upload ID image")
        if (!files.contractFile) return toast.error("Please upload contract file")
        
        setSubmitting(true)
        try {
        const payload = new FormData()
        payload.append('email', formData.email)
        payload.append('firstName', formData.name.trim().split(' ')[0])
        payload.append('lastName', formData.name.trim().split(' ').slice(1).join(' ') || '-')
        payload.append('phone', formData.phone)
        payload.append('nationalId', formData.nationalId)
        payload.append('roomId', formData.selectedRoom)
        payload.append('startDate', formData.startDate)
        formData.endDate && payload.append('endDate', formData.endDate)
        
        payload.append('idCardFile', files.idFile)
        payload.append('contractFile', files.contractFile)
        payload.append('agreedBaseRent', String(formData.rent || "0"))
        payload.append('initialElectricity', String(formData.initElec || "0"))
        payload.append('initialWater', String(formData.initWater || "0"))
        
        const res = await api.tenants.create(payload)
        if (res.error) throw new Error(res.error)

        setGeneratedPass(res.tempPassword)
        setSubmitted(true)
        toast.success('Registration Complete')
        } catch (error: any) { 
        toast.error(error.message) 
        } finally { 
        setSubmitting(false) 
        }
    }

    const resetForm = () => window.location.reload()

    return {
        availableRooms, loading, submitting, submitted, generatedPass,
        formData, files, 
        actions: { updateForm, handleRoomSelect, handleFileChange, handleSubmit, resetForm }
    }
}