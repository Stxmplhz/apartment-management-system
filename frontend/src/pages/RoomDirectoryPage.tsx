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
  
  // Local UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="space-y-8 pb-10">
      
      <RoomFilterBar 
        filters={filters} 
        stats={stats} 
        onAddClick={() => setIsAddModalOpen(true)} 
      />

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

      {/* Modals & Drawers */}
      {isAddModalOpen && (
        <AddRoomModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={actions.refresh} 
          existingRooms={rooms} 
        />
      )}

      {selectedRoom && (
        <RoomDetailDrawer 
          room={selectedRoom} 
          onClose={() => setSelectedRoom(null)}
          onUpdatePrice={actions.handleUpdatePrice}
          onDelete={actions.handleDeleteRoom}
        />
      )}
      
    </div>
  )
}