import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CustomerProvider } from '@/context/CustomerContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/pages/LoginPage'
import CustomerListPage from '@/pages/customers/CustomerListPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route index element={<Navigate to="/customers" replace />} />
                <Route path="customers" element={<CustomerListPage />} />
                <Route path="customers/:id" element={<div className="p-8 text-center text-gray-400">Customer 360° — coming soon</div>} />
                {/* Other modules — coming soon */}
                <Route path="*" element={<Navigate to="/customers" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CustomerProvider>
    </AuthProvider>
  )
}
