import PageShell from '@/components/ui/PageShell'
import { Download, FilePlus, Clock } from 'lucide-react'

const reports = [
  { name: 'Monthly Sales Report', date: 'Jun 2026', size: '2.4 MB', type: 'PDF' },
  { name: 'Customer Analytics Q2', date: 'Jun 2026', size: '1.8 MB', type: 'Excel' },
  { name: 'Financial Summary 2026', date: 'May 2026', size: '3.1 MB', type: 'PDF' },
  { name: 'Inventory Status Report', date: 'May 2026', size: '0.9 MB', type: 'Excel' },
  { name: 'AI Forecast Report', date: 'Apr 2026', size: '1.2 MB', type: 'PDF' },
]

const btn = { padding: '0.55rem 1.1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }

export default function ReportsPage() {
  return (
    <PageShell
      title="Reports"
      subtitle="Generate, export and schedule business reports."
      actions={
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button style={btn}><FilePlus size={15} strokeWidth={1.8} /> Generate PDF</button>
          <button style={{ ...btn, background: '#fff', color: '#4f46e5', border: '1px solid #e8eaf0' }}><FilePlus size={15} strokeWidth={1.8} /> Generate Excel</button>
          <button style={{ ...btn, background: '#fff', color: '#64748b', border: '1px solid #e8eaf0' }}><Clock size={15} strokeWidth={1.8} /> Schedule</button>
        </div>
      }
    >
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eaf0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.855rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eaf0' }}>
              {['Report Name', 'Date', 'Type', 'Size', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: '#0f172a' }}>{r.name}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#64748b' }}>{r.date}</td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span style={{ padding: '0.18rem 0.5rem', background: '#f0f0ff', color: '#4f46e5', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>{r.type}</span>
                </td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#94a3b8' }}>{r.size}</td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <button style={{ padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid #e8eaf0', borderRadius: 6, fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Download size={13} strokeWidth={2} /> Download
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
