import AdminPageShell from '@/components/admin/AdminPageShell'
import DataTable from '@/components/admin/DataTable'
import { mockAuditLogs, AuditLog } from '@/data/adminMockData'
import s from '@/components/admin/admin.module.css'

export default function AdminAuditPage() {
  const columns = [
    { key: 'user', header: 'User Name' },
    { key: 'action', header: 'Action Performed' },
    { key: 'timestamp', header: 'Timestamp' },
    { key: 'ip', header: 'IP Address' },
    { key: 'status', header: 'Status', render: (r: AuditLog) => (
      <span className={`${s.badge} ${r.status === 'Success' ? s.badgeSuccess : s.badgeDanger}`}>{r.status}</span>
    )},
  ]

  return (
    <AdminPageShell title="Audit Logs" subtitle="Track user logins, actions, updates, deletions and report downloads">
      <DataTable columns={columns} data={mockAuditLogs} searchKeys={['user', 'action', 'ip']}
        filters={[{ key: 'status', label: 'All Status', options: ['Success', 'Failed'] }]}
      />
    </AdminPageShell>
  )
}
