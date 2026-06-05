import PageShell from '@/components/ui/PageShell'

const notifications = [
  { icon: '🎯', title: 'Revenue Target Reached', desc: 'You\'ve hit 100% of your Q2 revenue target of $280,000!', time: '2m ago', type: 'success', unread: true },
  { icon: '⚠️', title: 'Low Stock Alert', desc: 'Widget B is below reorder point (85 units remaining).', time: '1h ago', type: 'warning', unread: true },
  { icon: '👤', title: 'New User Registered', desc: 'A new admin account has been created by john@example.com.', time: '3h ago', type: 'info', unread: false },
  { icon: '📊', title: 'Weekly Report Ready', desc: 'Your weekly analytics report for Jun 1–7 is ready to download.', time: '5h ago', type: 'info', unread: false },
  { icon: '🔔', title: 'Performance Alert', desc: 'Sales dropped 12% compared to last Tuesday. Review dashboard.', time: '1d ago', type: 'warning', unread: false },
]

const typeColors: Record<string, string> = { success: '#10b981', warning: '#f59e0b', info: '#3b82f6' }

export default function NotificationsPage() {
  return (
    <PageShell title="Notifications" subtitle="Business alerts, performance updates & system notifications.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map(n => (
          <div key={n.title} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${typeColors[n.type]}`, opacity: n.unread ? 1 : 0.7 }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{n.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{n.title}{n.unread && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: '#6c63ff', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 4 }}>NEW</span>}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.time}</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{n.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
