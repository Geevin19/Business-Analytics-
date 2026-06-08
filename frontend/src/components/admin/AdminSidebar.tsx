import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2, Users, UserCircle, Package, Warehouse,
  TrendingUp, FileText, Bell, Shield, ScrollText, Building2, Settings,
  Lock, LogOut, } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import styles from './AdminSidebar.module.css'

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Analytics', icon: BarChart2, to: '/admin/analytics' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Customers', icon: UserCircle, to: '/admin/customers' },
  { label: 'Products', icon: Package, to: '/admin/products' },
  { label: 'Inventory', icon: Warehouse, to: '/admin/inventory' },
  { label: 'Sales', icon: TrendingUp, to: '/admin/sales' },
  { label: 'Reports', icon: FileText, to: '/admin/reports' },
  { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
  { label: 'Roles & Permissions', icon: Shield, to: '/admin/roles' },
  { label: 'Audit Logs', icon: ScrollText, to: '/admin/audit-logs' },
  { label: 'Company Settings', icon: Building2, to: '/admin/company-settings' },
  { label: 'System Settings', icon: Settings, to: '/admin/system-settings' },
  { label: 'Security', icon: Lock, to: '/admin/security' },
]

interface Props { open: boolean }

export default function AdminSidebar({ open }: Props) {
  const { user, profile, logout } = useAuth()

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>A</div>
        {open && (
          <div>
            <div className={styles.brandName}>Admin Panel</div>
            <div className={styles.brandSub}>BizAnalytics</div>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            title={item.label}
          >
            <item.icon size={17} strokeWidth={1.8} />
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        {open && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{profile?.name?.[0]?.toUpperCase() ?? 'A'}</div>
            <div>
              <div className={styles.userName}>{profile?.name ?? user?.email?.split('@')[0] ?? 'Admin'}</div>
              <div className={styles.userRole}>{profile?.role ?? 'ADMIN'}</div>
            </div>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={logout} title="Logout">
          <LogOut size={16} strokeWidth={1.8} />
          {open && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
