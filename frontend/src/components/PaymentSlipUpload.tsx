import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Invoice } from '@/lib/types'

interface PaymentSlipUploadProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PaymentSlipUpload({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: PaymentSlipUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type and size
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
        toast.error('Please upload an image (JPG/PNG) or PDF')
        return
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setFile(selectedFile)

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    try {
      setSubmitting(true)

      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          // Create payment record with slip URL (base64 encoded image)
          await api.payments.create({
            invoiceId: invoice.id,
            amount: invoice.totalAmount,
            slipUrl: base64String,
          })

          toast.success('Payment slip uploaded successfully!')
          setFile(null)
          setPreview(null)
          onOpenChange(false)
          onSuccess?.()
        } catch (error) {
          console.error('Failed to upload slip:', error)
          toast.error('Failed to upload payment slip')
        } finally {
          setSubmitting(false)
        }
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Error processing file')
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
          <DialogDescription>
            Upload a screenshot or photo of your payment receipt for invoice {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            {preview ? (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="flex gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file')?.click()}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Change File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                    disabled={submitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Input
                  id="file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={submitting}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => document.getElementById('file')?.click()}
                  disabled={submitting}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Click to upload
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, or PDF up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Invoice Info */}
          <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
            <p className="text-xs text-muted-foreground">Invoice Amount</p>
            <p className="font-semibold">${invoice.totalAmount.toFixed(2)}</p>
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
