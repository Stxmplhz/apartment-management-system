import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Mail, Lock } from 'lucide-react'

export function LoginForm({ form }: any) {
  const { email, setEmail, password, setPassword, isLoading, error, handleSubmit } = form

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-[13px] font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[13px] font-medium text-foreground ml-1">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-11 pl-10 rounded-xl bg-secondary/50 border-border/60 focus:bg-background focus:border-blue-500 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <Label htmlFor="password" className="text-[13px] font-medium text-foreground">Password</Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-11 pl-10 rounded-xl bg-secondary/50 border-border/60 focus:bg-background focus:border-blue-500 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-11 mt-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20 transition-all">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  )
}