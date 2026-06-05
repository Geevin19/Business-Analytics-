import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/AuthLayout'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

import DashboardPage from '@/pages/dashboard/DashboardPage'
import SalesPage from '@/pages/analytics/SalesPage'
import CustomersPage from '@/pages/analytics/CustomersPage'
import FinancePage from '@/pages/analytics/FinancePage'
import InventoryPage from '@/pages/analytics/InventoryPage'
import ForecastingPage from '@/pages/ai/ForecastingPage'
import TrendsPage from '@/pages/ai/TrendsPage'
import RecommendationsPage from '@/pages/ai/RecommendationsPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import NotificationsPage from '@/pages/NotificationsPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminAuditPage from '@/pages/admin/AdminAuditPage'
import AdminMonitorPage from '@/pages/admin/AdminMonitorPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analytics/sales" element={<SalesPage />} />
              <Route path="/analytics/customers" element={<CustomersPage />} />
              <Route path="/analytics/finance" element={<FinancePage />} />
              <Route path="/analytics/inventory" element={<InventoryPage />} />
              <Route path="/ai/forecasting" element={<ForecastingPage />} />
              <Route path="/ai/trends" element={<TrendsPage />} />
              <Route path="/ai/recommendations" element={<RecommendationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditPage />} />
              <Route path="/admin/system-monitor" element={<AdminMonitorPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
