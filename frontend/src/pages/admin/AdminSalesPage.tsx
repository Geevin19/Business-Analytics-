import { useState, useEffect } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import DataTable from '@/components/admin/DataTable'
import { useToast } from '@/components/admin/useToast'
import { Sale } from '@/data/adminMockData'
import { getSales } from '@/services/admin.service'
import { Plus } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

const statusClass: Record<string, string> = {
  Completed: s.badgeSuccess,
  Pending: s.badgeWarning,
  Cancelled: s.badgeDanger,
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  useEffect(() => { let mounted = true; getSales().then(d => { if (mounted) setSales(d) }).catch(() => {}); return () => { mounted = false } }, [])
  const { show, Toast } = useToast()

  const columns = [
    { key: 'id', header: 'Sale ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'product', header: 'Product' },
    { key: 'amount', header: 'Amount', render: (r: Sale) => `$${r.amount.toLocaleString()}` },
    { key: 'date', header: 'Date' },
    { key: 'status', header: 'Status', render: (r: Sale) => (
      <span className={`${s.badge} ${statusClass[r.status]}`}>{r.status}</span>
    )},
  ]

  return (
    <AdminPageShell title="Sales Management" subtitle="Track daily, weekly, monthly and yearly sales performance"
      actions={<button className={s.btnPrimary} onClick={() => show('Add sale form opened')}><Plus size={15} /> Add Sale</button>}>
      <div className={s.tabs}>
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((t, i) => (
          <button key={t} className={`${s.tab} ${i === 2 ? s.tabActive : ''}`}>{t} Sales</button>
        ))}
      </div>
      <DataTable columns={columns} data={sales} searchKeys={['customer', 'product', 'id']}
        filters={[{ key: 'status', label: 'All Status', options: ['Completed', 'Pending', 'Cancelled'] }]}
        actions={(row: Sale) => (
          <>
            <button className={s.btnIcon} onClick={() => show(`Editing sale ${row.id}`)}>Edit</button>
            <button className={s.btnDanger} onClick={() => { setSales(s => s.filter(x => x.id !== row.id)); show('Sale deleted') }}>Delete</button>
          </>
        )}
      />
      {Toast}
    </AdminPageShell>
  )
}
