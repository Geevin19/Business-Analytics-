import { Menu, Search, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import NotificationBell from './NotificationBell'
import styles from './Navbar.module.css'

interface Props { onMenuClick: () => void }

export default function Navbar({ onMenuClick }: Props) {
  const { user, profile } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.iconBtn} onClick={onMenuClick} title="Toggle sidebar">
          <Menu size={18} strokeWidth={1.8} />
        </button>
        <div className={styles.search}>
          <Search size={14} className={styles.searchIcon} />
          <input placeholder="Search..." className={styles.searchInput} />
        </div>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={17} strokeWidth={1.8} /> : <Sun size={17} strokeWidth={1.8} />}
        </button>
        <NotificationBell />
        <div className={styles.avatar} title={profile?.name ?? user?.email}>
          {profile?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  )
}
