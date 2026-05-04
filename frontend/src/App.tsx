import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/shared/Layout'
import LoginPage from './pages/LoginPage'
import RoomDirectoryPage from './pages/RoomDirectoryPage'
import MoveInPage from './pages/MoveInPage'
import MeterReadingPage from './pages/MeterReadingPage'
import InvoicesPage from './pages/InvoicesPage'
import PaymentsPage from './pages/PaymentsPage'
import TenantDashboard from './pages/TenantDashboard'
import MaintenancePage from './pages/MaintenancePage'
import UserManagementPage from './pages/UserManagementPage'
import LeaseManagementPage from './pages/LeaseManagementPage'
import TenantInvoicesPage from './pages/TenantInvoicesPage'
import TenantMaintenancePage from './pages/TenantMaintenancePage'
import DashboardPage from './pages/DashboardPage'

// Helper component for role-based redirection at the root path
const HomeRedirect = () => {
  const { user } = useAuth()
  if (user?.role === 'TENANT') return <Navigate to="/dashboard" replace />
  if (user?.role === 'TECHNICIAN') return <Navigate to="/maintenance" replace />
  return <DashboardPage /> // Default for Admin
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Index route with smart redirect */}
          <Route index element={<HomeRedirect />} />

          {/* Admin Only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="rooms" element={<RoomDirectoryPage />} />
            <Route path="move-in" element={<MoveInPage />} />
            <Route path="meter" element={<MeterReadingPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="leases" element={<LeaseManagementPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
          </Route>

          {/* Tenant Only */}
          <Route element={<ProtectedRoute allowedRoles={['TENANT']} />}>
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="my-invoices" element={<TenantInvoicesPage />} />
            <Route path="my-maintenance" element={<TenantMaintenancePage />} />
          </Route>

          {/* Admin Only: invoices + maintenance */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="invoices" element={<InvoicesPage />} />
          </Route>

          {/* Technician Only */}
          <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
            <Route index element={<MaintenancePage />} />
          </Route>

          {/* Shared: Admin + Technician */}
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  )
}

export default App
