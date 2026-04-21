export function DemoCredentials() {
  return (
    <div className="mt-6 pt-6 border-t border-border">
      <p className="text-xs text-muted-foreground mb-3">Demo Credentials:</p>
      <div className="space-y-1.5 text-xs">
        <div className="p-2 rounded bg-secondary/50">
          <p className="font-mono text-muted-foreground">Admin: admin@apartment.com / admin123</p>
        </div>
        <div className="p-2 rounded bg-secondary/50">
          <p className="font-mono text-muted-foreground">Tenant: somchai@email.com / tenant123</p>
        </div>
        <div className="p-2 rounded bg-secondary/50">
          <p className="font-mono text-muted-foreground">Tech: tech@apartment.com / tech123</p>
        </div>
      </div>
    </div>
  )
}