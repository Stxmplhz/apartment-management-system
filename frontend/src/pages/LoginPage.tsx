import { useLoginForm } from '@/hooks/useLoginForm'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { DemoCredentials } from '@/components/features/auth/DemoCredentials'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const form = useLoginForm()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity"
        style={{ backgroundImage: 'url(/apartment-bg.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background pointer-events-none" />
      
      {/* Glow decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight" style={{ fontFamily: 'Lexend, sans-serif' }}>NestAdmin</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1.5 font-medium">Management System</p>
          </div>
        </div>

        {/* Login box */}
        <div className="bg-card border border-border/60 rounded-[24px] p-8 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Lexend, sans-serif' }}>Welcome back</h2>
            <p className="text-[13px] text-muted-foreground mt-1.5">Enter your credentials to access your account</p>
          </div>

          <LoginForm form={form} />

          <div className="mt-8 pt-6 border-t border-border/60">
            <DemoCredentials />
          </div>
        </div>
        
        <p className="text-center text-[11px] text-muted-foreground mt-8 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} NestAdmin. All rights reserved.
        </p>
      </div>
    </div>
  )
}
