import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/lib/types'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: Role[]
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true })
      return
    }

    // Check if user has required role
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
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
  }, [isAuthenticated, user, isLoading, requiredRoles, navigate])

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

  return <>{children}</>
}