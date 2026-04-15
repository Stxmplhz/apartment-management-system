import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RoomDirectoryPage from './pages/RoomDirectoryPage'
import MoveInPage from './pages/MoveInPage'
import MeterReadingPage from './pages/MeterReadingPage'
import InvoicesPage from './pages/InvoicesPage'
import PaymentsPage from './pages/PaymentsPage'
import TenantDashboard from './pages/TenantDashboard'
import MaintenancePage from './pages/MaintenancePage'

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
          {/* Admin Routes */}
          <Route index element={<RoomDirectoryPage />} />
          <Route path="move-in" element={<MoveInPage />} />
          <Route path="meter" element={<MeterReadingPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="payments" element={<PaymentsPage />} />

          {/* Tenant Routes */}
          <Route path="dashboard" element={<TenantDashboard />} />

          {/* Maintenance Routes */}
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
