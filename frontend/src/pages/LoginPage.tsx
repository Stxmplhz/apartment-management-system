import { useLoginForm } from '@/hooks/useLoginForm'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { DemoCredentials } from '@/components/features/auth/DemoCredentials'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const form = useLoginForm()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-lg bg-foreground flex items-center justify-center shadow-md">
            <Building2 className="h-6 w-6 text-background" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">ApartmentOS</h1>
          <p className="text-sm text-muted-foreground">Property Management System</p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            
            <LoginForm form={form} />

            <DemoCredentials />
            
          </CardContent>
        </Card>
        
      </div>
    </div>
  )
}