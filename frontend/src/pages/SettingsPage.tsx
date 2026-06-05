import PageShell from '@/components/ui/PageShell'
import { useTheme } from '@/context/ThemeContext'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  return (
    <PageShell title="Settings" subtitle="Manage your preferences and application settings.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 600 }}>
        {[
          { label: 'Dark Mode', desc: 'Toggle dark/light theme', action: <button onClick={toggleTheme} style={{ padding: '0.45rem 1rem', background: theme === 'dark' ? '#6c63ff' : '#f1f5f9', color: theme === 'dark' ? '#fff' : '#374151', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem' }}>{theme === 'dark' ? 'On' : 'Off'}</button> },
          { label: 'Email Notifications', desc: 'Receive business performance alerts by email', action: <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} /> },
          { label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts', action: <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} /> },
          { label: 'Data Export Format', desc: 'Default export format for reports', action: <select style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.875rem' }}><option>PDF</option><option>Excel</option><option>CSV</option></select> },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.label}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>{s.desc}</div>
            </div>
            {s.action}
          </div>
        ))}
      </div>
    </PageShell>
  )
}
