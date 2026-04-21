import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export function MoveInSuccess({ generatedPass, onReset }: { generatedPass: string | null, onReset: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl text-center space-y-6 bg-white shadow-lg animate-in zoom-in-95">
      <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-emerald-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Registration Complete!</h2>
        <p className="text-muted-foreground text-sm">Tenant account and lease created.</p>
      </div>
      <div className="p-6 bg-slate-50 rounded-xl space-y-2 border border-dashed border-slate-200">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Temporary Password</p>
        <p className="font-mono text-3xl font-bold text-blue-600 tracking-widest">{generatedPass}</p>
      </div>
      <Button onClick={onReset} className="w-full h-12 font-bold rounded-xl bg-slate-900 hover:bg-black">
        Next Registration
      </Button>
    </div>
  )
}