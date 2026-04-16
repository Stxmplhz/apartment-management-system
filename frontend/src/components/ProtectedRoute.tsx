import { ReactNode } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/lib/types'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from "sonner"

interface ProtectedRouteProps {
  children?: ReactNode 
  allowedRoles?: Role[] 
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true })
      return
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        toast.error("You don't have permission to access this page")
        
        if (user.role === 'TENANT') {
          navigate('/dashboard', { replace: true })
        } else if (user.role === 'TECHNICIAN') {
          navigate('/maintenance', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
        return
      }
    }

    setIsAuthorized(true)
  }, [isAuthenticated, user, isLoading, allowedRoles, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  return children ? <>{children}</> : <Outlet />
}