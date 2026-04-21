import React from "react";
import { cn } from "@/lib/utils";

export function DetailItem({ icon, label, value, highlight = false }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-blue-200">
      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <div className="overflow-hidden">
        <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter leading-none mb-1">{label}</p>
        <p className={cn("text-sm font-bold truncate", highlight ? "text-blue-600" : "text-slate-700")}>
          {value || "Not Set"}
        </p>
      </div>
    </div>
  );
}