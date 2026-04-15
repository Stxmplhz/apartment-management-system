import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { RoomCard } from "@/components/RoomCard"
import type { Room, RoomStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Building2, CheckCircle, DoorOpen, Wrench, Loader2 } from "lucide-react"

type FilterStatus = RoomStatus | 'all'

export default function RoomDirectoryPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const data = await api.rooms.list()
      setRooms(data)
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'VACANT').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  }

  const filteredRooms = filter === 'all' 
    ? rooms 
    : rooms.filter(r => r.status === filter)

  const floors = [...new Set(filteredRooms.map(r => r.floor))].sort()

  const filters: { value: FilterStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'VACANT', label: 'Available', count: stats.available }, 
    { value: 'OCCUPIED', label: 'Occupied', count: stats.occupied },
    { value: 'MAINTENANCE', label: 'Maintenance', count: stats.maintenance },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Room Directory</h1>
        <p className="text-muted-foreground mt-1">Manage and monitor all apartment units</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-2xl font-semibold mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-500 uppercase tracking-wide">Available</p>
              <p className="text-2xl font-semibold mt-1">{stats.available}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-500 uppercase tracking-wide">Occupied</p>
              <p className="text-2xl font-semibold mt-1">{stats.occupied}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <DoorOpen className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-500 uppercase tracking-wide">Maintenance</p>
              <p className="text-2xl font-semibold mt-1">{stats.maintenance}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              filter === f.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Room Grid by Floor */}
      <div className="space-y-6">
        {floors.map(floor => {
          const floorRooms = filteredRooms.filter(r => r.floor === floor)
          return (
            <div key={floor}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">Floor {floor}</h2>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{floorRooms.length} units</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {floorRooms.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No rooms found</h3>
          <p className="text-sm text-muted-foreground">No rooms match the selected filter</p>
        </div>
      )}
    </div>
  )
}
