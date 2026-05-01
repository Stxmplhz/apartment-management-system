import { useState, useEffect, useMemo } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { Room } from "@/lib/types"

export type MeterReading = {
    previous: number;
    current: string;
    isSaved?: boolean;
}

export type RoomMeterData = {
    electricity: MeterReading;
    water: MeterReading;
}

export interface PendingMeterRoom extends Room {
    isSaved: boolean;
    baselineData?: { 
        electricity: number;
        water: number 
    };
    recordedData?: { 
        electricity?: number; 
        water?: number 
    };
}

export function useMeters() {
    const [occupiedRooms, setOccupiedRooms] = useState<PendingMeterRoom[]>([])
    
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [meterData, setMeterData] = useState<Record<string, RoomMeterData>>({})
  
    // Filters & Settings
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFloor, setSelectedFloor] = useState<string>("all")
    const rates = { elec: 4.5, water: 18 }

    const loadData = async () => {
        try {
            setLoading(true)
            const roomsData = (await api.meters.pending(selectedMonth)) as PendingMeterRoom[]
            setOccupiedRooms(roomsData)
            
            const initial: Record<string, RoomMeterData> = {}
            roomsData.forEach((room) => {
                initial[room.id] = {
                    electricity: { 
                        previous: room.baselineData?.electricity || 0, 
                        current: room.recordedData?.electricity?.toString() || "", 
                        isSaved: room.isSaved 
                    },
                    water: { 
                        previous: room.baselineData?.water || 0, 
                        current: room.recordedData?.water?.toString() || "", 
                        isSaved: room.isSaved
                    },
                }
            })
            setMeterData(initial)
        } catch (error) {
            toast.error('Failed to sync data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { 
        loadData() 
    }, [selectedMonth])

    const calculateUsage = (previous: number, current: string) => {
        if (current === "") return { usage: 0, valid: true, empty: true }
        const curr = parseFloat(current)
        if (isNaN(curr) || curr < previous) return { usage: 0, valid: false, empty: false }
        return { 
            usage: curr - previous, 
            valid: true, 
            empty: false 
        }
    }

    const updateMeter = (roomId: string, type: 'electricity' | 'water', value: string) => {
        setMeterData(prev => ({
            ...prev,
            [roomId]: { ...prev[roomId], [type]: { ...prev[roomId][type], current: value } },
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const invalidRooms: string[] = []
        occupiedRooms.forEach(room => {
            const data = meterData[room.id]
            const savedElec = room.recordedData?.electricity?.toString() || ""
            const savedWater = room.recordedData?.water?.toString() || ""
            const isChanged = (!room.isSaved) || (data.electricity.current !== savedElec) || (data.water.current !== savedWater)
            
            if (!isChanged) return 
            
            if (data?.electricity.current !== "" && data?.water.current !== "") {
                const eCurr = parseFloat(data.electricity.current)
                const wCurr = parseFloat(data.water.current)
                
                let roomError = ""
                if (isNaN(eCurr) || eCurr < data.electricity.previous) {
                    roomError += `Elec (${eCurr} < ${data.electricity.previous})`
                }
                if (isNaN(wCurr) || wCurr < data.water.previous) {
                    roomError += (roomError ? ", " : "") + `Water (${wCurr} < ${data.water.previous})`
                }
                
                if (roomError) invalidRooms.push(`Room ${room.number}: ${roomError}`)
            }
        })

        if (invalidRooms.length > 0) {
            return toast.error(
                <div className="space-y-1">
                    <p className="font-bold">Invalid Readings Detected:</p>
                    <ul className="list-disc pl-4 text-[11px]">
                        {invalidRooms.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>, 
                { duration: 6000, style: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' } }
            )
        }

        const roomsToUpdate = occupiedRooms.filter(room => {
            const data = meterData[room.id]
            if (!data || data.electricity.current === "" || data.water.current === "") return false
            const savedElec = room.recordedData?.electricity?.toString() || ""
            const savedWater = room.recordedData?.water?.toString() || ""
            return (!room.isSaved) || (data.electricity.current !== savedElec) || (data.water.current !== savedWater)
        })

        if (roomsToUpdate.length === 0) return toast.info("No changes detected.")

        setSubmitting(true)  
        try {
            toast.loading(`Processing ${roomsToUpdate.length} room(s)...`, { id: 'save-toast' })
            for (const room of roomsToUpdate) {
                const data = meterData[room.id]
                await api.meters.bulkCreate({
                    roomId: room.id, month: selectedMonth, 
                    electricity: {
                        previousValue: data.electricity.previous,
                        currentValue: parseFloat(data.electricity.current),
                        rateAtTime: rates.elec
                    },
                    water: {
                        previousValue: data.water.previous,
                        currentValue: parseFloat(data.water.current),
                        rateAtTime: rates.water
                    }
                })
                try {
                    await api.invoices.generate({ roomId: room.id, month: selectedMonth, monthDisplay: selectedMonth })
                } catch (err: any) {
                    console.warn(`Invoice generation skipped for Room ${room.number}`);
                }
            }
            toast.success(`Successfully saved meters for ${roomsToUpdate.length} room(s)!`, { id: 'save-toast' })
            loadData() 
        } catch (error) {
            toast.error('An error occurred during the save process.', { id: 'save-toast' })
        } finally {
            setSubmitting(false)
        }
    }

    const uniqueFloors = useMemo(() => [...new Set(occupiedRooms.map(r => r.floor))].sort((a, b) => a - b), [occupiedRooms])
    const filteredRooms = useMemo(() => occupiedRooms.filter(r => {
        const matchesSearch = r.number.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFloor = selectedFloor === "all" || r.floor.toString() === selectedFloor
        return matchesSearch && matchesFloor
    }), [occupiedRooms, searchQuery, selectedFloor])

    const stats = useMemo(() => ({
        saved: occupiedRooms.filter(r => r.isSaved).length,
        todo: occupiedRooms.filter(r => !r.isSaved).length
    }), [occupiedRooms])

    return {
        filteredRooms, meterData, loading, submitting, uniqueFloors, stats, rates,
        filters: { selectedMonth, setSelectedMonth, searchQuery, setSearchQuery, selectedFloor, setSelectedFloor },
        actions: { updateMeter, calculateUsage, handleSubmit }
    }
}