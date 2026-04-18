// @ts-nocheck
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { RoomCard } from "@/components/RoomCard"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import type { Room, RoomStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { 
  Building2, Plus, CheckCircle, DoorOpen, 
  Wrench, Loader2, Trash2, Search, X, 
  Banknote, AlertTriangle, ArrowRight
} from "lucide-react"
import { toast } from "sonner"

type FilterStatus = RoomStatus | 'all'

export default function RoomDirectoryPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState({ number: '', floor: '', price: '' });

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
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
      if (rooms.some(r => r.number === newRoom.number)) {
        return toast.error(`Room ${newRoom.number} already exists!`);
      }
      
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
    } catch (error) { 
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage || "Failed to add room.");
    }
  }

  const handleUpdatePrice = async (roomId: string) => {
    const newPriceInput = document.getElementById('price-edit') as HTMLInputElement;
    const newPrice = parseFloat(newPriceInput.value);
    
    if (isNaN(newPrice) || newPrice < 0) return toast.error("Invalid price");

    try {
      await api.rooms.update(roomId, { pricePerMonth: newPrice });
      toast.success("Room price updated");
      loadRooms();
    } catch (error) { toast.error("Failed to update price"); }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (room.status === 'OCCUPIED') {
      return toast.error("Cannot delete occupied room!", {
        description: "Please move out the tenant before deleting this unit.",
        icon: <AlertTriangle className="text-red-500" />
      });
    }

    if (!confirm(`Are you sure you want to delete Room ${room.number}?`)) return;

    try {
      await api.rooms.delete(room.id);
      toast.success("Room deleted successfully");
      loadRooms();
      setSelectedRoom(null); 
    } catch (error) {
      toast.error("Failed to delete room.");
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesStatus = filter === 'all' || r.status === filter;
    const matchesSearch = r.number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const currentPrice = r.pricePerMonth;
    const matchesMin = minPrice === "" || currentPrice >= parseFloat(minPrice);
    const matchesMax = maxPrice === "" || currentPrice <= parseFloat(maxPrice);
    
    return matchesStatus && matchesSearch && matchesMin && matchesMax;
  });

  const floors = [...new Set(filteredRooms.map(r => r.floor))].sort((a, b) => a - b);

  const filters = [
    { value: 'all', label: 'All', count: rooms.length },
    { value: 'VACANT', label: 'Available', count: rooms.filter(r => r.status === 'VACANT').length }, 
    { value: 'OCCUPIED', label: 'Occupied', count: rooms.filter(r => r.status === 'OCCUPIED').length },
    { value: 'MAINTENANCE', label: 'Maintenance', count: rooms.filter(r => r.status === 'MAINTENANCE').length },
  ]

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Room Directory</h1>
          <p className="text-muted-foreground text-sm">Filter by status, number, or price range</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Room */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search #" 
              className="pl-9 w-[110px] rounded-2xl bg-slate-50 border-none focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Price Range UI */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-2xl border border-slate-100">
            <Banknote className="h-4 w-4 text-slate-400" />
            <Input 
              type="number"
              placeholder="Min" 
              className="w-[70px] h-8 bg-transparent border-none p-0 text-center focus-visible:ring-0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <Input 
              type="number"
              placeholder="Max" 
              className="w-[70px] h-8 bg-transparent border-none p-0 text-center focus-visible:ring-0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100">
            <Plus className="h-4 w-4 mr-2" /> Add Unit
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-5 py-2 text-xs font-bold rounded-xl transition-all uppercase tracking-tighter",
              filter === f.value
                ? "bg-white text-blue-600 shadow-sm scale-105"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {f.label} <span className="ml-1 opacity-40">{f.count}</span>
          </button>
        ))}
        {(minPrice || maxPrice) && (
           <Button variant="ghost" size="sm" onClick={() => {setMinPrice(""); setMaxPrice("");}} className="h-7 text-[10px] text-red-500 hover:bg-red-50">Reset Price</Button>
        )}
      </div>

      {/* Room Grid - Horizontal Scroll */}
      <div className="space-y-12">
        {floors.map(floor => (
          <div key={floor} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
               <h2 className="text-xl font-black text-slate-800">Floor {floor}</h2>
               <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
            </div>
            
            <div className="flex overflow-x-auto pb-6 pt-2 gap-5 no-scrollbar scroll-smooth">
              {filteredRooms.filter(r => r.floor === floor).map(room => (
                <div 
                  key={room.id} 
                  onClick={() => setSelectedRoom(room)} 
                  className="flex-none w-[240px] cursor-pointer group"
                >
                  <div className="group-hover:translate-y-[-5px] transition-all duration-300">
                    <RoomCard room={room} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed rounded-[3rem]">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-900 text-lg">No matching rooms</h3>
          <p className="text-sm text-slate-500">Try adjusting your search, price range, or filter settings.</p>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <Card className="w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-200">
            <form onSubmit={handleAddRoom} className="p-10 space-y-8 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black">New Unit</h2>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsAddModalOpen(false)}><X/></Button>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1 text-slate-500 uppercase text-[10px]">Room Number</Label>
                    <Input required placeholder="e.g. 101" value={newRoom.number} onChange={e => setNewRoom({...newRoom, number: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none text-lg font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold ml-1 text-slate-500 uppercase text-[10px]">Floor</Label>
                      <Input required type="number" placeholder="1" value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold ml-1 text-slate-500 uppercase text-[10px]">Rent Price</Label>
                      <Input required type="number" placeholder="5000" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-black rounded-2xl h-14 text-lg font-bold">Create Room</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Room Detail Drawer */}
      {selectedRoom && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l shadow-2xl z-50 animate-in slide-in-from-right duration-300">
          <div className="p-10 space-y-10 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-black text-slate-900">Room {selectedRoom.number}</h2>
                <span className="text-blue-600 font-black text-xs uppercase tracking-widest">Level {selectedRoom.floor}</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-slate-100" onClick={() => setSelectedRoom(null)}><X className="h-6 w-6" /></Button>
            </div>

            <div className="space-y-8 flex-1">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Occupant</Label>
                {selectedRoom.status === 'OCCUPIED' && selectedRoom.currentTenant ? (
                  <div className="space-y-2">
                    <p className="font-bold text-xl text-slate-800">
                      {selectedRoom.currentTenant.firstName} {selectedRoom.currentTenant.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="bg-white px-2 py-1 rounded-md border text-slate-600">📞 {selectedRoom.currentTenant.phone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-sm text-slate-400 italic flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-slate-300" />
                    {selectedRoom.status === 'MAINTENANCE' ? 'Under Maintenance' : 'Room is currently vacant'}
                  </div>
                )}
              </div>

              {/* Price Management */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Market Pricing (Monthly)</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input 
                      type="number" 
                      defaultValue={selectedRoom.pricePerMonth}
                      id="price-edit"
                      className="h-14 rounded-2xl pl-10 font-black text-xl bg-slate-50 border-none"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                  </div>
                  <Button onClick={() => handleUpdatePrice(selectedRoom.id)} className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 px-6 font-bold">Apply</Button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <Button 
                variant="destructive" 
                className="w-full h-16 rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-lg shadow-red-50" 
                onClick={() => handleDeleteRoom(selectedRoom)}
              >
                <Trash2 className="h-5 w-5" /> Permanent Delete Unit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}