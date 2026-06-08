import { useRef, useState, useEffect } from 'react'
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react'
import { useNotifications, Notification } from '@/context/NotificationContext'
import { useNavigate } from 'react-router-dom'
import styles from './NotificationBell.module.css'

const typeColor: Record<string, string> = {
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER:  '#ef4444',
  INFO:    '#166D16',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleClick(n: Notification) {
    if (!n.read) markRead(n.id)
    setOpen(false)
    navigate('/notifications')
  }

  return (
    <div ref={ref} className={styles.wrap}>
      <button
        className={styles.bell}
        onClick={() => setOpen(o => !o)}
        title="Notifications"
      >
        <Bell size={17} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          {/* header */}
          <div className={styles.header}>
            <span className={styles.headerTitle}>Notifications</span>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button className={styles.actionBtn} onClick={markAllRead} title="Mark all read">
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
              <button className={styles.actionBtn} onClick={() => { setOpen(false); navigate('/notifications') }}>
                View all
              </button>
            </div>
          </div>

          {/* list */}
          <div className={styles.list}>
            {notifications.length === 0 && (
              <div className={styles.empty}>
                <Bell size={28} strokeWidth={1.2} />
                <p>No notifications yet</p>
              </div>
            )}
            {notifications.slice(0, 8).map(n => (
              <div
                key={n.id}
                className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                onClick={() => handleClick(n)}
              >
                <div
                  className={styles.dot}
                  style={{ background: typeColor[n.type] ?? '#166D16' }}
                />
                <div className={styles.content}>
                  <div className={styles.itemTitle}>
                    {n.title}
                    {!n.read && <span className={styles.newBadge}>NEW</span>}
                  </div>
                  <div className={styles.itemMsg}>{n.message}</div>
                  <div className={styles.itemTime}>{timeAgo(n.created_at)}</div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                  title="Delete"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
