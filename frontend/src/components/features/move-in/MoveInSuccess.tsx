import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Check } from "lucide-react"
import { useState } from "react"

export function MoveInSuccess({ generatedPass, onReset }: { generatedPass: string | null, onReset: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (generatedPass) {
      navigator.clipboard.writeText(generatedPass)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 animate-in zoom-in-95 duration-200">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-1 bg-emerald-500" />
        <div className="p-8 text-center space-y-5">
          <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>Registration Complete!</h2>
            <p className="text-xs text-muted-foreground mt-1">Tenant account and lease created successfully.</p>
          </div>
          <div className="relative">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Temporary Password</p>
            <div className="p-4 bg-secondary border border-border rounded-xl font-mono text-2xl tracking-widest font-bold text-foreground select-all">
              {generatedPass}
            </div>
            <button onClick={handleCopy}
              className="absolute right-3 bottom-3 h-7 w-7 rounded-md bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          </div>
          <Button onClick={onReset} className="w-full h-9 rounded-lg bg-foreground hover:bg-foreground/90 text-background text-sm font-medium">
            Next Registration
          </Button>
        </div>
      </div>
    </div>
  )
}
