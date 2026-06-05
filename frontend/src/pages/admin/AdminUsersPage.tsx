import PageShell from '@/components/ui/PageShell'

const users = [
  { name: 'Alice Johnson', email: 'alice@example.com', role: 'ADMIN', status: 'Active', joined: 'Jan 2026' },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'USER', status: 'Active', joined: 'Feb 2026' },
  { name: 'Carol White', email: 'carol@example.com', role: 'USER', status: 'Inactive', joined: 'Mar 2026' },
  { name: 'David Lee', email: 'david@example.com', role: 'MANAGER', status: 'Active', joined: 'Apr 2026' },
  { name: 'Eva Brown', email: 'eva@example.com', role: 'USER', status: 'Active', joined: 'May 2026' },
]

const roleColor: Record<string, string> = { ADMIN: '#6c63ff', MANAGER: '#3b82f6', USER: '#10b981' }

export default function AdminUsersPage() {
  return (
    <PageShell title="User Management" subtitle="Manage user accounts, roles and access control.">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg,#6c63ff,#764ba2)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem' }}>
          + Invite User
        </button>
      </div>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fc' }}>
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{u.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', background: `${roleColor[u.role]}18`, color: roleColor[u.role], borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>{u.role}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', background: u.status === 'Active' ? '#f0fdf4' : '#f8f9fc', color: u.status === 'Active' ? '#16a34a' : '#9ca3af', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>{u.status}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{u.joined}</td>
                <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button style={{ padding: '0.3rem 0.7rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.78rem', background: 'transparent' }}>Edit</button>
                  <button style={{ padding: '0.3rem 0.7rem', border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.78rem', background: 'transparent', color: '#ef4444' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
