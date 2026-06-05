import PageShell from '@/components/ui/PageShell'

const reports = [
  { name: 'Monthly Sales Report', date: 'Jun 2026', size: '2.4 MB', type: 'PDF' },
  { name: 'Customer Analytics Q2', date: 'Jun 2026', size: '1.8 MB', type: 'Excel' },
  { name: 'Financial Summary 2026', date: 'May 2026', size: '3.1 MB', type: 'PDF' },
  { name: 'Inventory Status Report', date: 'May 2026', size: '0.9 MB', type: 'Excel' },
  { name: 'AI Forecast Report', date: 'Apr 2026', size: '1.2 MB', type: 'PDF' },
]

export default function ReportsPage() {
  return (
    <PageShell title="Reporting Module" subtitle="Generate, export & schedule business reports.">
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {['Generate PDF Report', 'Generate Excel Report', 'Schedule Report'].map(btn => (
          <button key={btn} style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg,#6c63ff,#764ba2)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem' }}>
            {btn}
          </button>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Recent Reports</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fc' }}>
              {['Report Name', 'Date', 'Type', 'Size', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{r.date}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', background: r.type === 'PDF' ? '#fef2f2' : '#f0fdf4', color: r.type === 'PDF' ? '#dc2626' : '#16a34a', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                    {r.type}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{r.size}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <button style={{ padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.8rem', color: '#6c63ff' }}>↓ Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
