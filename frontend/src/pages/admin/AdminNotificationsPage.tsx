import { useState } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import { useToast } from '@/components/admin/useToast'
import { mockNotifications } from '@/data/adminMockData'
import { Bell, Plus } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const { show, Toast } = useToast()

  return (
    <AdminPageShell title="Notification Center" subtitle="Create, send and manage system notifications"
      actions={<button className={s.btnPrimary} onClick={() => show('Create notification form')}><Plus size={15} /> Create</button>}>
      <div className={s.activityList}>
        {notifications.map(n => (
          <div key={n.id} className={s.card} style={{ opacity: n.read ? 0.75 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Bell size={15} />
                  <strong style={{ fontSize: '0.9rem' }}>{n.title}</strong>
                  <span className={`${s.badge} ${s.badgeInfo}`}>{n.type}</span>
                  {!n.read && <span className={`${s.badge} ${s.badgeWarning}`}>Unread</span>}
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{n.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{n.createdAt}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {!n.read && (
                  <button className={s.btnIcon} onClick={() => {
                    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
                    show('Marked as read')
                  }}>Mark Read</button>
                )}
                <button className={s.btnDanger} onClick={() => {
                  setNotifications(prev => prev.filter(x => x.id !== n.id))
                  show('Notification deleted')
                }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {Toast}
    </AdminPageShell>
  )
}
