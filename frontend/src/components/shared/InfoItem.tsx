import React from "react"

export function InfoItem({ icon, label, value }: { icon: React.ReactElement, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border">
        {React.cloneElement(icon, { className: "h-5 w-5 text-muted-foreground" })}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}