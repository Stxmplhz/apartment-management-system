import { useMoveIn } from "@/hooks/useMoveIn"
import { TenantProfileCard } from "@/components/features/move-in/TenantProfileCard"
import { LeaseTermsCard } from "@/components/features/move-in/LeaseTermsCard"
import { MoveInSuccess } from "@/components/features/move-in/MoveInSuccess"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus } from "lucide-react"

export default function MoveInPage() {
  const { 
    availableRooms, loading, submitting, submitted, generatedPass, 
    formData, files, actions 
  } = useMoveIn()

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>

  if (submitted) {
    return <MoveInSuccess generatedPass={generatedPass} onReset={actions.resetForm} />
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 text-slate-900">
      <h1 className="text-2xl font-black tracking-tight">Move-in Registration</h1>

      <form onSubmit={actions.handleSubmit} className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column */}
        <TenantProfileCard 
          formData={formData} 
          files={files} 
          availableRooms={availableRooms} 
          actions={actions} 
        />

        {/* Right Column */}
        <div className="space-y-6">
          <LeaseTermsCard 
            formData={formData} 
            files={files} 
            actions={actions} 
          />
          
          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg font-bold shadow-md rounded-2xl bg-blue-600 hover:bg-blue-700" 
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2" />}
            Register & Generate Account
          </Button>
        </div>
        
      </form>
    </div>
  )
}