import PageShell from '@/components/ui/PageShell'
import { useEffect, useState } from 'react'
import api from '@/services/api'
import { UserPlus } from 'lucide-react'

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

const roleStyle: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: '#f0f0ff', color: '#4f46e5' },
  MANAGER: { bg: '#f0fdf4', color: '#16a34a' },
  USER: { bg: '#f8fafc', color: '#64748b' },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<UserRow[]>('/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell
      title="User Management"
      subtitle="Manage accounts, roles and access control."
      actions={
        <button style={{ padding: '0.55rem 1.1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <UserPlus size={15} strokeWidth={1.8} /> Invite User
        </button>
      }
    >
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eaf0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.855rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eaf0' }}>
              {['Name', 'Email', 'Role', 'Joined', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.855rem' }}>Loading...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.855rem' }}>No users found.</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>{u.email}</td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span style={{ padding: '0.18rem 0.55rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, background: roleStyle[u.role]?.bg ?? '#f8fafc', color: roleStyle[u.role]?.color ?? '#64748b' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <button style={{ padding: '0.3rem 0.7rem', border: '1px solid #e8eaf0', borderRadius: 6, fontSize: '0.78rem', background: 'transparent', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
