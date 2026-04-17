import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Wrench, Loader2, Upload, X } from 'lucide-react'
import type { MaintenanceRequest } from '@/lib/types'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/utils'

export default function MaintenancePage() {
  const { user } = useAuth()
  const userIsAdmin = user?.role === 'ADMIN'
  const userIsTechnician = user?.role === 'TECHNICIAN'
  const userIsTenant = user?.role === 'TENANT'
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [technicians, setTechnicians] = useState<any[]>([])
  
  // Form state
  const [description, setDescription] = useState('')  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
    if (userIsAdmin) {
      loadTechnicians()
    }
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await api.maintenance.list()
      setRequests(data)
    } catch (error) {
      console.error('Failed to load requests:', error)
      toast.error('Failed to load maintenance requests')
    } finally {
      setLoading(false)
    }
  }

  const loadTechnicians = async () => {
    try {
      const data = await api.maintenance.listTechnicians()
      setTechnicians(data) 
    } catch (error) {
      console.error('Failed to load technicians:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      toast.error('Please describe the maintenance issue')
      return
    }

    try {
      setSubmitting(true)

      await api.maintenance.create({
        tenantId: user?.id || '',
        description: description.trim(),
        imageUrl: imagePreview || undefined,
      })

      toast.success('Maintenance request submitted successfully!')
      setDescription('')
      setImageFile(null)
      setImagePreview(null)
      setShowForm(false)
      await loadRequests()
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error('Failed to submit maintenance request')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-500/15 text-amber-500'
      case 'ASSIGNED':
        return 'bg-blue-500/15 text-blue-500'
      case 'IN_PROGRESS':
        return 'bg-purple-500/15 text-purple-500'
      case 'RESOLVED':
        return 'bg-emerald-500/15 text-emerald-500'
      case 'CLOSED':
        return 'bg-gray-500/15 text-gray-500'
      case 'REJECTED':
        return 'bg-red-500/15 text-red-500'
      default:
        return 'bg-secondary text-foreground'
    }
  }

  const handleAssignTech = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsAssignModalOpen(true);
  };

  const confirmAssign = async (techId: string) => {
    if (!selectedRequestId) return;

    try {
      setLoading(true);
      await api.maintenance.assign(selectedRequestId, techId);
      toast.success('Technician assigned successfully!');
      setIsAssignModalOpen(false); 
      await loadRequests(); 
    } catch (error) {
      toast.error('Failed to assign technician');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, currentStatus: string) => {
    let options = "";
    if (currentStatus === 'ASSIGNED') options = "IN_PROGRESS, REJECTED";
    if (currentStatus === 'IN_PROGRESS') options = "RESOLVED";
    if (currentStatus === 'RESOLVED') options = "CLOSED";

    if (!options) {
      toast.info("No further transitions available");
      return;
    }

    const newStatus = prompt(`Current status: ${currentStatus}\nChoose next status: [${options}]`);
    
    if (!newStatus) return;
    
    const finalStatus = newStatus.toUpperCase().trim();
    if (!options.includes(finalStatus)) {
      toast.error("Invalid status selection");
      return;
    }

    try {
      setLoading(true);
      await api.maintenance.updateStatus(requestId, finalStatus);
      toast.success(`Status updated to ${finalStatus}`);
      await loadRequests();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Maintenance Requests</h1>
          <p className="text-muted-foreground mt-1">
            {userIsAdmin && 'View and manage all maintenance requests'}
            {userIsTenant && 'Submit and track your maintenance requests'}
            {userIsTechnician && 'View your assigned maintenance jobs'}
          </p>
        </div>
        {userIsTenant && (
          <Button onClick={() => setShowForm(!showForm)} size="lg" className="w-full md:w-auto">
            <Wrench className="h-4 w-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Tenant: New Request Form */}
      {userIsTenant && showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Submit Maintenance Request</CardTitle>
            <CardDescription>Describe the issue and upload photos if available</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Issue Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the maintenance issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  className="min-h-24"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium" >
                  Upload Photo (Optional)
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="flex gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={submitting}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('image')?.click()}
                          disabled={submitting}
                          className="flex-1"
                        >
                          Change Image
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
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
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={submitting}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => document.getElementById('image')?.click()}
                        disabled={submitting}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !description.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Wrench className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setDescription('')
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card className="border-border">
            <CardContent className="pt-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-1">No maintenance requests</h3>
              <p className="text-sm text-muted-foreground">
                {userIsTenant && 'Create a new request to get started'}
                {!userIsTenant && 'No requests available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map(request => (
              <Card key={request.id} className="border-border overflow-hidden">
                <CardContent className="p-0">
                  {/* Request Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-6 border-b border-border bg-secondary/30">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold line-clamp-1">{request.description}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(request.createdAt).toLocaleDateString()} at{' '}
                            {new Date(request.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={cn(
                          "inline-flex text-xs font-medium px-3 py-1 rounded-full flex-shrink-0",
                          getStatusColor(request.status)
                        )}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Content */}
                  <div className="p-4 md:p-6 space-y-3">
                    {/* Image */}
                    {request.imageUrl && (
                      <div className="mb-4 relative group overflow-hidden rounded-lg border border-border">
                        <img
                          src={getImageUrl(request.imageUrl)}
                          alt="Maintenance issue"
                          className="w-full h-48 md:h-64 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => window.open(getImageUrl(request.imageUrl), '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <p className="text-white text-xs font-medium">View Full Image</p>
                        </div>
                      </div>
                    )}

                    {/* Details */} 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {request.room && (
                        <div>
                          <p className="text-muted-foreground">Room</p>
                          <p className="font-medium">Room {request.room.number}</p>
                        </div>
                      )}
                      {request.tenant && (
                        <div>
                          <p className="text-muted-foreground">Tenant</p>
                          <p className="font-medium">
                            {request.tenant.firstName} {request.tenant.lastName}
                          </p>
                        </div>
                      )}
                      {request.technician && (
                        <div>
                          <p className="text-muted-foreground">Assigned To</p>
                          <p className="font-medium">
                            {request.technician.user?.email || 'Technician'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Admin Notes */}
                    {request.adminNotes && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs font-medium text-blue-500 mb-1">Admin Notes</p>
                        <p className="text-sm text-blue-700">{request.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {(userIsAdmin || userIsTechnician) && (
                  <div className="flex gap-2 p-4 md:p-6 pt-0 border-t border-border bg-secondary/20">
                    {userIsAdmin && request.status === 'OPEN' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleAssignTech(request.id)} 
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Assign Technician
                      </Button>
                    )}

                    {(userIsAdmin || userIsTechnician) && request.status !== 'OPEN' && request.status !== 'CLOSED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUpdateStatus(request.id, request.status)} 
                      >
                        Update Status
                      </Button>
                    )}
                  </div>
                )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Assign Technician Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assign Technician</CardTitle>
                <CardDescription>Select the best technician for this job</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAssignModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {technicians.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No technicians found.</p>
              ) : (
                technicians.map((tech) => (
                  <div 
                    key={tech.id} 
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tech.user?.email}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">
                            {tech.expertise || 'General'}
                          </span>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full",
                            (tech.activeJobsCount || 0) > 3 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                          )}>
                            Active Jobs: {tech.activeJobsCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => confirmAssign(tech.id)}>
                      Select
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

/*
1. 'OPEN' Status: Tenant has submitted a repair request -> The only button the Admin sees is "Assign Technician".
2. Press 'Assign Button': Enter Technician ID -> Status will automatically change to ASSIGNED (according to the Stamp backend logic).
3. 'ASSIGNED' Status: Once the technician accepts the job, the "Update Status" button will appear, changing to IN_PROGRESS.
4. Final Status: When the repair is complete, it changes to RESOLVED, and the Admin closes the job as CLOSED.
*/
