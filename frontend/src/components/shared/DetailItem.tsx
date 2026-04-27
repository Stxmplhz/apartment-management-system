import React from "react";
import { cn } from "@/lib/utils";

export function DetailItem({ icon, label, value, highlight = false }: any) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className="h-7 w-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
        {React.cloneElement(icon, { className: "h-3.5 w-3.5 text-muted-foreground" })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={cn("text-sm font-medium truncate", highlight ? "text-blue-400" : "text-foreground")}>
          {value || "Not Set"}
        </p>
      </div>
    </div>
  );
}
