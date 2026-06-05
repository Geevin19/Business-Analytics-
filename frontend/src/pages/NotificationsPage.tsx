import PageShell from '@/components/ui/PageShell'

const notifications = [
  { title: 'Revenue Target Reached', desc: 'You have hit 100% of your Q2 revenue target of $280,000.', time: '2m ago', type: 'success', unread: true },
  { title: 'Low Stock Alert', desc: 'Widget B is below reorder point — 85 units remaining.', time: '1h ago', type: 'warning', unread: true },
  { title: 'Weekly Report Ready', desc: 'Your weekly analytics report for Jun 1–7 is ready to download.', time: '5h ago', type: 'info', unread: false },
  { title: 'Performance Alert', desc: 'Sales dropped 12% compared to last Tuesday. Review dashboard.', time: '1d ago', type: 'warning', unread: false },
]

const typeStyle: Record<string, { dot: string; border: string }> = {
  success: { dot: '#4f46e5', border: '#4f46e5' },
  warning: { dot: '#d97706', border: '#d97706' },
  info: { dot: '#94a3b8', border: '#e8eaf0' },
}

export default function NotificationsPage() {
  return (
    <PageShell title="Notifications" subtitle="Business alerts and performance updates.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 720 }}>
        {notifications.map(n => (
          <div key={n.title} style={{ background: '#fff', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', border: '1px solid #e8eaf0', borderLeft: `3px solid ${typeStyle[n.type].border}`, opacity: n.unread ? 1 : 0.65 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeStyle[n.type].dot, flexShrink: 0, marginTop: '0.35rem' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {n.title}
                  {n.unread && <span style={{ fontSize: '0.65rem', background: '#4f46e5', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 3, fontWeight: 700, letterSpacing: '0.03em' }}>NEW</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>{n.time}</div>
              </div>
              <div style={{ fontSize: '0.845rem', color: '#64748b', lineHeight: 1.5 }}>{n.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
