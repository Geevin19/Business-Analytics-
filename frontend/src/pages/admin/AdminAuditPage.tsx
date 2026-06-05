import PageShell from '@/components/ui/PageShell'
import { useEffect, useState } from 'react'
import api from '@/services/api'

interface LogRow {
  id: string
  user_email: string
  action: string
  ip: string
  created_at: string
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<LogRow[]>('/admin/audit-logs')
      .then(r => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell title="Audit Logs" subtitle="Full activity history for security and compliance.">
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eaf0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.855rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eaf0' }}>
              {['User', 'Action', 'IP Address', 'Timestamp'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            )}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>No audit logs yet.</td></tr>
            )}
            {logs.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: '#0f172a' }}>{l.user_email}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#374151' }}>{l.action}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.8rem' }}>{l.ip}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#94a3b8' }}>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
