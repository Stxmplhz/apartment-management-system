import { useState, useEffect, useMemo } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { Room, RoomStatus } from "@/lib/types"

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")

  const loadRooms = async () => {
    try {
      setLoading(true)
      const data = await api.rooms.list()
      setRooms(data)
    } catch (error) {
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRooms() }, [])

  const handleUpdatePrice = async (roomId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return toast.error("Invalid price")
    try {
      await api.rooms.update(roomId, { pricePerMonth: newPrice })
      toast.success("Room price updated")
      loadRooms()
    } catch (error) { 
      toast.error("Failed to update price") 
    }
  }

  const handleDeleteRoom = async (room: Room) => {
    if (room.status === 'OCCUPIED') {
      return toast.error("Cannot delete occupied room!", {
        description: "Please move out the tenant before deleting this unit."
      })
    }
    if (!confirm(`Are you sure you want to delete Room ${room.number}?`)) return false

    try {
      await api.rooms.delete(room.id)
      toast.success("Room deleted successfully")
      loadRooms()
      return true
    } catch (error) {
      toast.error("Failed to delete room.")
      return false
    }
  }

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchesStatus = filter === 'all' || r.status === filter
      const matchesSearch = r.number.toLowerCase().includes(searchQuery.toLowerCase())
      
      const currentPrice = r.pricePerMonth
      const matchesMin = minPrice === "" || currentPrice >= parseFloat(minPrice)
      const matchesMax = maxPrice === "" || currentPrice <= parseFloat(maxPrice)
      
      return matchesStatus && matchesSearch && matchesMin && matchesMax
    })
  }, [rooms, filter, searchQuery, minPrice, maxPrice])

  const floors = useMemo(() => [...new Set(filteredRooms.map(r => r.floor))].sort((a, b) => a - b), [filteredRooms])
  
  const stats = useMemo(() => [
    { value: 'all', label: 'All', count: rooms.length },
    { value: 'VACANT', label: 'Available', count: rooms.filter(r => r.status === 'VACANT').length }, 
    { value: 'OCCUPIED', label: 'Occupied', count: rooms.filter(r => r.status === 'OCCUPIED').length },
    { value: 'MAINTENANCE', label: 'Maintenance', count: rooms.filter(r => r.status === 'MAINTENANCE').length },
  ], [rooms])

  return {
    rooms, filteredRooms, loading, floors, stats,
    filters: { filter, setFilter, searchQuery, setSearchQuery, minPrice, setMinPrice, maxPrice, setMaxPrice },
    actions: { refresh: loadRooms, handleUpdatePrice, handleDeleteRoom }
  }
}