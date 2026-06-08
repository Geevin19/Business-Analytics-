import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Sun, Moon, Search, Bell } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/admin/AdminSidebar'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme, toggleTheme } = useTheme()
  const { profile, user } = useAuth()

  return (
    <div className={styles.shell}>
      <AdminSidebar open={sidebarOpen} />
      <div className={styles.main}>
        <header className={styles.navbar}>
          <div className={styles.left}>
            <button className={styles.iconBtn} onClick={() => setSidebarOpen(o => !o)} title="Toggle menu">
              <Menu size={18} strokeWidth={1.8} />
            </button>
            <div className={styles.search}>
              <Search size={14} />
              <input placeholder="Search users, customers, products..." />
            </div>
          </div>
          <div className={styles.right}>
            <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button className={styles.iconBtn} title="Notifications">
              <Bell size={17} />
            </button>
            <div className={styles.avatar} title={profile?.name ?? user?.email}>
              {profile?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
