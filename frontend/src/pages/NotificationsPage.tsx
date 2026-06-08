import { useNotifications } from '@/context/NotificationContext'
import PageShell from '@/components/ui/PageShell'
import { CheckCheck, Trash2, Bell } from 'lucide-react'

const typeStyle: Record<string, { dot: string; border: string; label: string }> = {
  SUCCESS: { dot: '#22c55e', border: '#22c55e', label: 'Success' },
  WARNING: { dot: '#f59e0b', border: '#f59e0b', label: 'Warning' },
  DANGER:  { dot: '#ef4444', border: '#ef4444', label: 'Alert' },
  INFO:    { dot: '#166D16', border: '#166D16', label: 'Info' },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications()

  return (
    <PageShell
      title="Notifications"
      subtitle="Real-time business alerts and performance updates."
      actions={
        unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #e8eaf0', borderRadius: 7, fontSize: '0.82rem', fontWeight: 600, color: '#166D16', cursor: 'pointer' }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        ) : undefined
      }
    >
      {/* summary bar */}
      {unreadCount > 0 && (
        <div style={{ background: '#e8f5e8', border: '1px solid #a3d4a3', borderRadius: 10, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.855rem', color: '#166D16', fontWeight: 600 }}>
          <Bell size={15} /> You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 760 }}>
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Bell size={40} strokeWidth={1.2} style={{ margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ fontSize: '0.9rem' }}>No notifications yet. They'll appear here when your business generates alerts.</p>
          </div>
        )}

        {notifications.map(n => {
          const ts = typeStyle[n.type] ?? typeStyle.INFO
          return (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              style={{
                background: '#fff',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                border: '1px solid #e8eaf0',
                borderLeft: `3px solid ${ts.border}`,
                opacity: n.read ? 0.65 : 1,
                cursor: n.read ? 'default' : 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ts.dot, flexShrink: 0, marginTop: '0.35rem' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem', gap: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {n.title}
                    {!n.read && (
                      <span style={{ fontSize: '0.62rem', background: '#166D16', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 3, fontWeight: 700, letterSpacing: '0.03em' }}>NEW</span>
                    )}
                    <span style={{ fontSize: '0.68rem', background: `${ts.dot}18`, color: ts.dot, padding: '0.1rem 0.45rem', borderRadius: 3, fontWeight: 600 }}>{ts.label}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>{timeAgo(n.created_at)}</div>
                </div>
                <div style={{ fontSize: '0.845rem', color: '#64748b', lineHeight: 1.55 }}>{n.message}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '0.2rem', borderRadius: 4, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.15s' }}
                title="Delete"
                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}
