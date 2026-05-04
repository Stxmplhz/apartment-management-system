import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Upload, X, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/lib/types'

export function PaymentSlipUpload({ invoice, open, onOpenChange, onSuccess }: {
  invoice: Invoice, open: boolean, onOpenChange: (v: boolean) => void, onSuccess?: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) return toast.error('Please upload JPG, PNG or PDF')
    if (f.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB')
    setFile(f)
    if (f.type.startsWith('image/')) {
      const r = new FileReader(); r.onloadend = () => setPreview(r.result as string); r.readAsDataURL(f)
    } else { setPreview(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')
    
    setSubmitting(true)
    try {
      // 1. Upload to Cloudinary first
      const uploadRes = await api.upload(file, 'apartment_payments')
      if (uploadRes.error) throw new Error(uploadRes.error)
      
      // 2. Create payment record with the Cloudinary URL
      await api.payments.create({ 
        invoiceId: invoice.id, 
        amount: invoice.totalAmount, 
        slipUrl: uploadRes.url 
      })
      
      toast.success('Payment slip uploaded!')
      setFile(null); setPreview(null)
      onOpenChange(false); onSuccess?.()
    } catch (error: any) { 
      toast.error(error.message || 'Upload failed') 
    } finally { 
      setSubmitting(false) 
    }
  }

  const reset = () => { setFile(null); setPreview(null) }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl border-border p-0 overflow-hidden gap-0">
        <div className="h-1 bg-blue-500" />
        <div className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-sm font-medium">Upload Payment Slip</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Invoice {invoice.invoiceNumber}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {/* Upload area */}
            <div className={`border-2 border-dashed rounded-xl transition-colors ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-border hover:border-blue-300 hover:bg-blue-50/20'}`}>
              {preview ? (
                <div className="p-3 space-y-3">
                  <img src={preview} alt="Preview" className="w-full h-36 object-cover rounded-lg" />
                  <div className="flex gap-2">
                    <label htmlFor="slip-file" className="flex-1 cursor-pointer">
                      <div className="h-8 rounded-lg border border-border bg-card flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">
                        Change File
                      </div>
                    </label>
                    <button type="button" onClick={reset} className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-secondary transition-colors">
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : file ? (
                <div className="p-5 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">PDF selected</p>
                  </div>
                  <button type="button" onClick={reset} className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-secondary">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <label htmlFor="slip-file" className="flex flex-col items-center gap-2 p-8 cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Click to upload slip</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or PDF · max 5MB</p>
                </label>
              )}
              <input id="slip-file" type="file" accept="image/*,.pdf" onChange={handleFile} disabled={submitting} className="hidden" />
            </div>

            {/* Invoice summary */}
            <div className="flex items-center justify-between p-3 bg-secondary border border-border rounded-lg">
              <span className="text-xs text-muted-foreground">Amount Due</span>
              <span className="text-sm font-medium text-blue-600" style={{ fontFamily: 'Lexend, sans-serif' }}>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-border flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" className="rounded-lg h-9" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || submitting} size="sm" className="rounded-lg h-9 bg-blue-500 hover:bg-blue-600 text-white px-6">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
