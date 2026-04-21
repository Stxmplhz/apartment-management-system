import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Landmark, Zap, Droplets, FileText } from "lucide-react"

export function LeaseTermsCard({ formData, files, actions }: any) {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="font-semibold flex items-center gap-2 border-b pb-3 text-blue-600">
        <Landmark className="h-4 w-4" /> Lease Terms
      </h2>
      <div className="space-y-2">
        <Label>Monthly Rent (THB)</Label>
        <Input type="number" required value={formData.rent} onChange={e => actions.updateForm('rent', e.target.value)} className="text-xl font-bold text-emerald-600" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contract Start Date</Label>
          <Input type="date" value={formData.startDate} onChange={e => actions.updateForm('startDate', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Contract End Date (Optional)</Label>
          <Input type="date" value={formData.endDate} onChange={e => actions.updateForm('endDate', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex gap-1 text-xs"><Zap className="h-3 w-3" /> Initial Electric</Label>
          <Input type="number" value={formData.initElec} onChange={e => actions.updateForm('initElec', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="flex gap-1 text-xs"><Droplets className="h-3 w-3" /> Initial Water</Label>
          <Input type="number" value={formData.initWater} onChange={e => actions.updateForm('initWater', e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Signed Lease Agreement (PDF/Image)</Label>
        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer relative hover:bg-secondary/50">
          <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => e.target.files && actions.handleFileChange('contractFile', e.target.files[0])} />
          <FileText className="mx-auto mb-2 text-muted-foreground h-5 w-5" />
          <p className="text-xs font-medium">{files.contractFile ? files.contractFile.name : "Click to upload Signed Contract"}</p>
        </div>
      </div>
    </Card>
  )
}