import PageShell from '@/components/ui/PageShell'

const settings = [
  { label: 'Email Notifications', desc: 'Receive business performance alerts by email', action: <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#16a34a' }} /> },
  { label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts', action: <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#16a34a' }} /> },
  {
    label: 'Data Export Format', desc: 'Default format for generated reports',
    action: (
      <select style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.875rem', background: 'var(--bg-2)', color: 'var(--text)' }}>
        <option>PDF</option><option>Excel</option><option>CSV</option>
      </select>
    )
  },
  { label: 'Language', desc: 'Display language for the dashboard', action: <select style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.875rem', background: 'var(--bg-2)', color: 'var(--text)' }}><option>English</option><option>Spanish</option><option>French</option></select> },
]

export default function SettingsPage() {
  return (
    <PageShell title="Settings" subtitle="Manage your preferences and application settings.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 600 }}>
        {settings.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{s.label}</div>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{s.desc}</div>
            </div>
            {s.action}
          </div>
        ))}
      </div>
    </PageShell>
  )
}
