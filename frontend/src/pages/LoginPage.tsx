import { useLoginForm } from '@/hooks/useLoginForm'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { DemoCredentials } from '@/components/features/auth/DemoCredentials'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const form = useLoginForm()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>NestAdmin</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Apartment Management System</p>
        </div>

        {/* Login box */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <LoginForm form={form} />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">Demo accounts</span>
            </div>
          </div>

          <DemoCredentials />
        </div>
      </div>
    </div>
  )
}
