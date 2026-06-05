import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className={styles.shell}>
      <Sidebar open={sidebarOpen} />
      <div className={styles.main}>
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
