import AdminPageShell from '@/components/admin/AdminPageShell'
import { useToast } from '@/components/admin/useToast'
import { Download, FileText, Printer } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

const reports = [
  'Revenue Reports', 'Sales Reports', 'Customer Reports', 'Product Reports',
  'Inventory Reports', 'User Activity Reports',
]

export default function AdminReportsPage() {
  const { show, Toast } = useToast()

  return (
    <AdminPageShell title="Reports Management" subtitle="Generate, export and manage business reports">
      <div className={s.grid3}>
        {reports.map(r => (
          <div key={r} className={s.card}>
            <div className={s.cardTitle}>{r}</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Generate and download the latest {r.toLowerCase()}.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className={s.btnSecondary} onClick={() => show(`${r} PDF exported`)}><FileText size={14} /> PDF</button>
              <button className={s.btnSecondary} onClick={() => show(`${r} Excel exported`)}><Download size={14} /> Excel</button>
              <button className={s.btnSecondary} onClick={() => show(`${r} CSV exported`)}>CSV</button>
              <button className={s.btnSecondary} onClick={() => show('Print dialog opened')}><Printer size={14} /> Print</button>
            </div>
          </div>
        ))}
      </div>
      {Toast}
    </AdminPageShell>
  )
}
