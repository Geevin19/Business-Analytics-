import PageShell from '@/components/ui/PageShell'

const logs = [
  { user: 'alice@example.com', action: 'Exported Sales Report', ip: '192.168.1.10', time: '2026-06-05 14:22' },
  { user: 'david@example.com', action: 'Updated User Role', ip: '192.168.1.14', time: '2026-06-05 13:10' },
  { user: 'bob@example.com', action: 'Logged In', ip: '10.0.0.5', time: '2026-06-05 09:45' },
  { user: 'alice@example.com', action: 'Deleted Report', ip: '192.168.1.10', time: '2026-06-04 16:30' },
  { user: 'system', action: 'Scheduled Report Generated', ip: 'localhost', time: '2026-06-04 00:00' },
]

export default function AdminAuditPage() {
  return (
    <PageShell title="Audit Logs" subtitle="Full activity history for security and compliance tracking.">
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fc' }}>
              {['User', 'Action', 'IP Address', 'Timestamp'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{l.user}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#374151' }}>{l.action}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontFamily: 'monospace', fontSize: '0.825rem' }}>{l.ip}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
