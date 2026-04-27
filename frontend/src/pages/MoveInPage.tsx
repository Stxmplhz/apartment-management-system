import { useMoveIn } from "@/hooks/useMoveIn"
import { TenantProfileCard } from "@/components/features/move-in/TenantProfileCard"
import { LeaseTermsCard } from "@/components/features/move-in/LeaseTermsCard"
import { MoveInSuccess } from "@/components/features/move-in/MoveInSuccess"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus } from "lucide-react"

export default function MoveInPage() {
  const { availableRooms, loading, submitting, submitted, generatedPass, formData, files, actions } = useMoveIn()

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
  if (submitted) return <MoveInSuccess generatedPass={generatedPass} onReset={actions.resetForm} />

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-20">
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
        <h1 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Move-in Registration</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Register a new tenant and generate their account</p>
      </div>

      <form onSubmit={actions.handleSubmit} className="grid lg:grid-cols-2 gap-5 items-start">
        <TenantProfileCard formData={formData} files={files} availableRooms={availableRooms} actions={actions} />
        <div className="space-y-5">
          <LeaseTermsCard formData={formData} files={files} actions={actions} />
          <Button type="submit" size="lg" className="w-full h-12 font-semibold rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-sm" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Register & Generate Account
          </Button>
        </div>
      </form>
    </div>
  )
}
