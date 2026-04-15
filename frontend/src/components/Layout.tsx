import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="md:pl-56 pt-14 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
