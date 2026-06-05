import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, Users, DollarSign, Package,
  Brain, FileText, Bell, Settings, User, Shield, LogOut,
  ChevronRight, BarChart2
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import styles from './Sidebar.module.css'

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  {
    label: 'Analytics', icon: BarChart2, children: [
      { label: 'Sales', to: '/analytics/sales' },
      { label: 'Customers', to: '/analytics/customers' },
      { label: 'Finance', to: '/analytics/finance' },
      { label: 'Inventory', to: '/analytics/inventory' },
    ]
  },
  {
    label: 'AI Features', icon: Brain, children: [
      { label: 'Forecasting', to: '/ai/forecasting' },
      { label: 'Trends', to: '/ai/trends' },
      { label: 'Recommendations', to: '/ai/recommendations' },
    ]
  },
  { label: 'Reports', icon: FileText, to: '/reports' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
  {
    label: 'Admin', icon: Shield, children: [
      { label: 'Users', to: '/admin/users' },
      { label: 'Audit Logs', to: '/admin/audit-logs' },
      { label: 'System Monitor', to: '/admin/system-monitor' },
    ]
  },
  { label: 'Profile', icon: User, to: '/profile' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

interface Props { open: boolean }

export default function Sidebar({ open }: Props) {
  const { user, profile, logout } = useAuth()

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>⚡</span>
        {open && <span className={styles.brandName}>BizAnalytics</span>}
      </div>

      <nav className={styles.nav}>
        {nav.map(item => (
          item.children ? (
            <NavGroup key={item.label} item={item} open={open} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={18} />
              {open && <span>{item.label}</span>}
            </NavLink>
          )
        ))}
      </nav>

      <div className={styles.footer}>
        {open && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{profile?.name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
            <div>
              <div className={styles.userName}>{profile?.name ?? user?.email ?? 'User'}</div>
              <div className={styles.userRole}>{profile?.role ?? 'USER'}</div>
            </div>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={logout} title="Logout">
          <LogOut size={18} />
          {open && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

function NavGroup({ item, open }: { item: typeof nav[0]; open: boolean }) {
  return (
    <div className={styles.group}>
      <div className={styles.groupLabel}>
        {item.icon && <item.icon size={18} />}
        {open && <span>{item.label}</span>}
        {open && <ChevronRight size={14} className={styles.chevron} />}
      </div>
      {open && item.children?.map(child => (
        <NavLink
          key={child.to}
          to={child.to}
          className={({ isActive }) => `${styles.link} ${styles.subLink} ${isActive ? styles.active : ''}`}
        >
          <span>{child.label}</span>
        </NavLink>
      ))}
    </div>
  )
}
