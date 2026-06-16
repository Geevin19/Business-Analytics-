import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { NotificationProvider } from '@/context/NotificationContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminRoute from '@/components/AdminRoute'
import AppLayout from '@/layouts/AppLayout'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Public
import LandingPage from '@/pages/LandingPage'

// User auth
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Admin auth (separate portal)
import AdminLoginPage from '@/pages/admin/AdminLoginPage'

// User pages
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
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'

// Admin pages
import AdminHomePage from '@/pages/admin/AdminHomePage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminCustomersPage from '@/pages/admin/AdminCustomersPage'
import AdminSalesPage from '@/pages/admin/AdminSalesPage'
import AdminProductsPage from '@/pages/admin/AdminProductsPage'
import AdminInventoryPage from '@/pages/admin/AdminInventoryPage'
import AdminReportsPage from '@/pages/admin/AdminReportsPage'
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage'
import AdminRolesPage from '@/pages/admin/AdminRolesPage'
import AdminAuditPage from '@/pages/admin/AdminAuditPage'
import AdminCompanySettingsPage from '@/pages/admin/AdminCompanySettingsPage'
import AdminSystemSettingsPage from '@/pages/admin/AdminSystemSettingsPage'
import AdminSecurityPage from '@/pages/admin/AdminSecurityPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public landing */}
              <Route path="/" element={<LandingPage />} />

              {/* User auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Admin login — standalone page, no AuthLayout wrapper */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* User dashboard (authenticated, non-admin) */}
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
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Admin panel (only geevinrs@gmail.com) */}
              <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminHomePage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/customers" element={<AdminCustomersPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/inventory" element={<AdminInventoryPage />} />
                <Route path="/admin/sales" element={<AdminSalesPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                <Route path="/admin/roles" element={<AdminRolesPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditPage />} />
                <Route path="/admin/company-settings" element={<AdminCompanySettingsPage />} />
                <Route path="/admin/system-settings" element={<AdminSystemSettingsPage />} />
                <Route path="/admin/security" element={<AdminSecurityPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
