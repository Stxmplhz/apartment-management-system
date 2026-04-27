import { useState } from "react"
import { useRooms } from "@/hooks/useRooms"
import { RoomCard } from "@/components/features/rooms/RoomCard"
import { RoomFilterBar } from "@/components/features/rooms/RoomFilterBar"
import { AddRoomModal } from "@/components/features/rooms/AddRoomModal"
import { RoomDetailDrawer } from "@/components/features/rooms/RoomDetailDrawer"
import type { Room } from "@/lib/types"
import { Building2, Loader2 } from "lucide-react"

export default function RoomDirectoryPage() {
  const { rooms, filteredRooms, loading, floors, stats, filters, actions } = useRooms()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6 pb-10">
      <RoomFilterBar filters={filters} stats={stats} onAddClick={() => setIsAddModalOpen(true)} />

      <div className="space-y-8">
        {floors.map(floor => (
          <div key={floor}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Floor {floor}</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
              {filteredRooms.filter(r => r.floor === floor).map(room => (
                <div key={room.id} onClick={() => setSelectedRoom(room)} className="flex-none w-[200px] cursor-pointer">
                  <RoomCard room={room} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-20 bg-secondary/50 border-2 border-dashed border-border rounded-2xl">
          <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground text-sm" style={{ fontFamily: 'Lexend, sans-serif' }}>No matching rooms</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {isAddModalOpen && <AddRoomModal onClose={() => setIsAddModalOpen(false)} onSuccess={actions.refresh} existingRooms={rooms} />}
      {selectedRoom && <RoomDetailDrawer room={selectedRoom} onClose={() => setSelectedRoom(null)} onUpdatePrice={actions.handleUpdatePrice} onDelete={actions.handleDeleteRoom} />}
    </div>
  )
}
