import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { RoomCard } from "@/components/RoomCard"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import type { Room, RoomStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Building2, Plus, CheckCircle, DoorOpen, Wrench, Loader2, Trash2, Search, X } from "lucide-react"
import { toast } from "sonner"

type FilterStatus = RoomStatus | 'all'

export default function RoomDirectoryPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState({ number: '', floor: '', price: '' });

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

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.rooms.create({
        number: newRoom.number,
        floor: parseInt(newRoom.floor),
        pricePerMonth: parseFloat(newRoom.price),
        status: 'VACANT'
      })
      toast.success("Room added!")
      setIsAddModalOpen(false)
      setNewRoom({ number: '', floor: '', price: '' })
      loadRooms()
    } catch (error) { toast.error("Failed to add room") }
  }

  const handleUpdatePrice = async (roomId: string) => {
    const newPrice = (document.getElementById('price-edit') as HTMLInputElement).value;
    try {
      await api.rooms.update(roomId, { pricePerMonth: parseFloat(newPrice) });
      toast.success("Room price updated for future tenants");
      loadRooms();
    } catch (error) { toast.error("Failed to update price"); }
  };

  const handleToggleMaintenance = async (room: Room) => {
    const newStatus = room.status === 'MAINTENANCE' ? 'VACANT' : 'MAINTENANCE';
    try {
      await api.rooms.update(room.id, { status: newStatus });
      toast.success(`Room is now ${newStatus.toLowerCase()}`);
      loadRooms();
      setSelectedRoom(null);
    } catch (error) { toast.error("Status change failed"); }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;

    try {
      await api.rooms.delete(roomId);
      toast.success("Room deleted successfully");
      loadRooms();
      setSelectedRoom(null); 
    } catch (error) {
      toast.error("Failed to delete room. Make sure it has no active leases.");
    }
  };

  
  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'VACANT').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  }

  const filteredRooms = rooms.filter(r => 
    (filter === 'all' || r.status === filter) &&
    (r.number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Room Directory</h1>
          <p className="text-muted-foreground">Manage and monitor all apartment units</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input 
              placeholder="Search room..." 
              className="pl-9 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Room</Button>
        </div>
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
      <div className="space-y-8">
        {floors.map(floor => (
          <div key={floor}>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Floor {floor}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredRooms.filter(r => r.floor === floor).map(room => (
                <div key={room.id} onClick={() => setSelectedRoom(room)} className="cursor-pointer hover:scale-[1.02] transition-transform">
                  <RoomCard room={room} />
                </div>
              ))}
            </div>
          </div>
        ))}
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

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md">
            <form onSubmit={handleAddRoom}>
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Add New Room</h2>
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input required placeholder="e.g. 101" value={newRoom.number} onChange={e => setNewRoom({...newRoom, number: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Input required type="number" placeholder="1" value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input required type="number" placeholder="5000" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Create Room</Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Room Detail Drawer */}
      {selectedRoom && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l shadow-2xl z-50 animate-in slide-in-from-right">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Room {selectedRoom.number} Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedRoom(null)}><X /></Button>
            </div>

            <div className="space-y-4">
              {/* Tenant & Lease Status */}
              <div className="p-4 rounded-xl bg-secondary/30">
                <Label className="text-xs uppercase text-muted-foreground">Current Occupant</Label>
                {selectedRoom.status === 'OCCUPIED' && selectedRoom.leases && selectedRoom.leases.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    <p className="font-semibold text-lg">
                      {selectedRoom.leases[0].tenant.firstName} {selectedRoom.leases[0].tenant.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📞 {selectedRoom.leases[0].tenant.phone}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 py-2 text-sm text-muted-foreground italic flex items-center gap-2">
                    <DoorOpen className="h-4 w-4" />
                    {selectedRoom.status === 'MAINTENANCE' ? 'Under Maintenance' : 'No active lease'}
                  </div>
                )}
              </div>

              {/* Market Price Editing Form */}
              <div className="space-y-2">
                <Label>Market Price (per month)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    defaultValue={selectedRoom.pricePerMonth}
                    id="price-edit"
                  />
                  <Button onClick={() => handleUpdatePrice(selectedRoom.id)}>Update</Button>
                </div>
              </div>

              {/* Quick Actions Button */}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button 
                  variant="outline"
                  className={selectedRoom.status === 'MAINTENANCE' ? "bg-amber-500/10" : ""}
                  onClick={() => handleToggleMaintenance(selectedRoom)}
                >
                  <Wrench className="mr-2 h-4 w-4" /> {selectedRoom.status === 'MAINTENANCE' ? "Finish Repair" : "Set Maintenance"}
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteRoom(selectedRoom.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}
