import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2, Users, DollarSign, Package,
  Brain, FileText, Bell, Settings, User, Shield, LogOut,
  ChevronDown, TrendingUp, Zap
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import styles from './Sidebar.module.css'
import { useState } from 'react'

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  {
    label: 'Analytics', icon: BarChart2, children: [
      { label: 'Sales', to: '/analytics/sales', icon: TrendingUp },
      { label: 'Customers', to: '/analytics/customers', icon: Users },
      { label: 'Finance', to: '/analytics/finance', icon: DollarSign },
      { label: 'Inventory', to: '/analytics/inventory', icon: Package },
    ]
  },
  {
    label: 'AI Features', icon: Brain, children: [
      { label: 'Forecasting', to: '/ai/forecasting', icon: TrendingUp },
      { label: 'Trends', to: '/ai/trends', icon: BarChart2 },
      { label: 'Recommendations', to: '/ai/recommendations', icon: Zap },
    ]
  },
  { label: 'Reports', icon: FileText, to: '/reports' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
  { label: 'Admin Panel', icon: Shield, to: '/admin/dashboard' },
  { label: 'Profile', icon: User, to: '/profile' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

interface Props { open: boolean }

export default function Sidebar({ open }: Props) {
  const { user, profile, logout } = useAuth()

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>B</div>
        {open && <span className={styles.brandName}>BizAnalytics</span>}
      </div>

      <nav className={styles.nav}>
        {nav.map(item =>
          item.children ? (
            <NavGroup key={item.label} item={item} open={open} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={17} strokeWidth={1.8} />
              {open && <span>{item.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      <div className={styles.footer}>
        {open && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{profile?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{profile?.name ?? user?.email?.split('@')[0] ?? 'User'}</div>
              <div className={styles.userRole}>{profile?.role ?? 'USER'}</div>
            </div>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={logout} title="Logout">
          <LogOut size={16} strokeWidth={1.8} />
          {open && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

function NavGroup({ item, open }: { item: typeof nav[0]; open: boolean }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className={styles.group}>
      <button className={styles.groupLabel} onClick={() => open && setExpanded(e => !e)}>
        <item.icon size={17} strokeWidth={1.8} />
        {open && (
          <>
            <span>{item.label}</span>
            <ChevronDown size={13} className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`} />
          </>
        )}
      </button>
      {open && expanded && item.children?.map(child => (
        <NavLink
          key={child.to}
          to={child.to}
          className={({ isActive }) => `${styles.link} ${styles.subLink} ${isActive ? styles.active : ''}`}
        >
          <child.icon size={15} strokeWidth={1.8} />
          <span>{child.label}</span>
        </NavLink>
      ))}
    </div>
  )
}
