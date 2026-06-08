import PageShell from '@/components/ui/PageShell'
import { useAuth } from '@/context/AuthContext'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  return (
    <PageShell title="Profile" subtitle="Manage your account information.">
      <div style={{ background: '#fff', borderRadius: 14, padding: '2rem', maxWidth: 600, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {profile?.name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profile?.name ?? 'User'}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{user?.email ?? ''}</div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', background: '#d4edd4', color: '#16a34a', padding: '0.15rem 0.5rem', borderRadius: 4, display: 'inline-block', fontWeight: 600 }}>{profile?.role ?? 'USER'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[{ label: 'Full Name', value: profile?.name ?? '' }, { label: 'Email', value: user?.email ?? '' }].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
              <input defaultValue={f.value} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.9rem' }} />
            </div>
          ))}
          <button style={{ padding: '0.75rem', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, marginTop: '0.5rem' }}>
            Save Changes
          </button>
        </div>
      </div>
    </PageShell>
  )
}
