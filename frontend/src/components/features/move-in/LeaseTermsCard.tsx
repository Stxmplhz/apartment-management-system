import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Landmark, Zap, Droplets, FileText, CheckCircle } from "lucide-react"

export function LeaseTermsCard({ formData, files, actions }: any) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Landmark className="h-4 w-4 text-blue-500" />
        <h2 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Lease Terms</h2>
      </div>
      <div className="p-5 space-y-4">
        {/* Monthly rent */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Monthly Rent (THB)</Label>
          <Input type="number" required value={formData.rent} onChange={e => actions.updateForm('rent', e.target.value)}
            className="h-9 rounded-lg bg-secondary border-border text-sm font-semibold text-blue-600" />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
            <Input type="date" value={formData.startDate} onChange={e => actions.updateForm('startDate', e.target.value)}
              className="h-9 rounded-lg bg-secondary border-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">End Date (Optional)</Label>
            <Input type="date" value={formData.endDate} onChange={e => actions.updateForm('endDate', e.target.value)}
              className="h-9 rounded-lg bg-secondary border-border text-sm" />
          </div>
        </div>

        {/* Initial meter readings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Initial Electric (kWh)
            </Label>
            <Input type="number" value={formData.initElec} onChange={e => actions.updateForm('initElec', e.target.value)}
              className="h-9 rounded-lg bg-secondary border-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-500" /> Initial Water (m³)
            </Label>
            <Input type="number" value={formData.initWater} onChange={e => actions.updateForm('initWater', e.target.value)}
              className="h-9 rounded-lg bg-secondary border-border text-sm" />
          </div>
        </div>

        {/* Contract upload */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Signed Lease Agreement</Label>
          <div className="relative border-2 border-dashed border-border rounded-lg p-5 text-center hover:bg-secondary/50 transition-colors cursor-pointer">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && actions.handleFileChange('contractFile', e.target.files[0])} />
            {files.contractFile ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">{files.contractFile.name}</span>
              </div>
            ) : (
              <>
                <FileText className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Click to upload Contract</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">PDF or Image</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
