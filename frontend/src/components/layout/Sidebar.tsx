import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2,
  Brain, FileText, Bell, Settings, User, LogOut,
  ChevronDown, TrendingUp, Zap, Sigma, Database
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import styles from './Sidebar.module.css'
import { useState, useEffect } from 'react'
import api from '@/services/api'
import type { AxiosResponse } from 'axios'
import BizAnalyticsLogo from '@/components/BizAnalyticsLogo'

interface AnalyzedColumn {
  id: string
  datasetId: string
  datasetName: string
  columnName: string
  trend: string
  trendPercentage: number
  mean: number
  min: number
  max: number
}

const nav = [
  {
    label: 'AI Features', icon: Brain, children: [
      { label: 'AI Analysis Center', to: '/ai/analysis-center', icon: Brain },
      { label: 'Forecasting', to: '/ai/forecasting', icon: TrendingUp },
      { label: 'Trends', to: '/ai/trends', icon: BarChart2 },
      { label: 'Recommendations', to: '/ai/recommendations', icon: Zap },
    ]
  },
  { label: 'Reports', icon: FileText, to: '/reports' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
  { label: 'Profile', icon: User, to: '/profile' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

interface Props { open: boolean }

export default function Sidebar({ open }: Props) {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [analyzedColumns, setAnalyzedColumns] = useState<AnalyzedColumn[]>([])

  // Load analyzed columns for the Analytical section
  const loadAnalyzedColumns = () => {
    api.get('/trend/analyzed-columns')
      .then((res: AxiosResponse<AnalyzedColumn[]>) => setAnalyzedColumns(res.data))
      .catch(() => {}) // silently fail - no data yet
  }

  // Load on mount and when path changes
  useEffect(() => {
    loadAnalyzedColumns()
  }, [location.pathname])

  // Also refresh when custom event is dispatched (e.g. after file upload)
  useEffect(() => {
    const handler = () => loadAnalyzedColumns()
    window.addEventListener('datasets-changed', handler)
    return () => window.removeEventListener('datasets-changed', handler)
  }, [])

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <BizAnalyticsLogo size={22} />
        </div>
        {open && <span className={styles.brandName}>BizAnalytics</span>}
      </div>

      <nav className={styles.nav}>
        {/* Dashboard always first */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          <LayoutDashboard size={17} strokeWidth={1.8} />
          {open && <span>Dashboard</span>}
        </NavLink>

        {/* ── Analytical Section (always visible) ── */}
        <AnalyticalNavGroup columns={analyzedColumns} open={open} navigate={navigate} />

        {/* Rest of nav items (AI Features, Reports, etc.) */}
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

/* ── Dynamic Analytical Nav Group ── */
function AnalyticalNavGroup({ columns, open, navigate }: { columns: AnalyzedColumn[]; open: boolean; navigate: (path: string) => void }) {
  const [expanded, setExpanded] = useState(true)

  // Group columns by dataset
  const grouped = columns.reduce<Record<string, AnalyzedColumn[]>>((acc, col) => {
    if (!acc[col.datasetName]) acc[col.datasetName] = []
    acc[col.datasetName].push(col)
    return acc
  }, {})

  return (
    <div className={styles.group}>
      <button className={styles.groupLabel} onClick={() => open && setExpanded(e => !e)}>
        <Sigma size={17} strokeWidth={1.8} />
        {open && (
          <>
            <span>Analytical</span>
            <span className={styles.badge}>{columns.length}</span>
            <ChevronDown size={13} className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`} />
          </>
        )}
      </button>
      {open && expanded && (
        <>
          {/* User Data page link */}
          <NavLink
            to="/analytics/user-data"
            className={({ isActive }) => `${styles.link} ${styles.subLink} ${isActive ? styles.active : ''}`}
          >
            <BarChart2 size={15} strokeWidth={1.8} />
            <span>User Data</span>
          </NavLink>

          {/* Dynamic dataset groups */}
          {Object.entries(grouped).map(([datasetName, cols]) => (
            <div key={datasetName} className={styles.datasetGroup}>
              <button
                className={styles.datasetGroupLabel}
                onClick={() => navigate(`/analytics/user-data?dataset=${encodeURIComponent(datasetName)}`)}
                title="View in Data Trend Analyzer"
                style={{ cursor: 'pointer' }}
              >
                <Database size={12} strokeWidth={1.8} />
                <span>{datasetName}</span>
              </button>
              {cols.map(col => (
                <NavLink
                  key={col.id}
                  to={`/analytical/${col.id}`}
                  className={({ isActive }) => `${styles.link} ${styles.subLink} ${isActive ? styles.active : ''}`}
                >
                  <span>{col.columnName}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}