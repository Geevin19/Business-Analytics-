import { useState, useEffect } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import DataTable from '@/components/admin/DataTable'
import { useToast } from '@/components/admin/useToast'
import { Customer } from '@/data/adminMockData'
import { getCustomers } from '@/services/admin.service'
import { UserPlus } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  useEffect(() => { let mounted = true; getCustomers().then(d => { if (mounted) setCustomers(d) }).catch(() => {}); return () => { mounted = false } }, [])
  const [modal, setModal] = useState(false)
  const { show, Toast } = useToast()

  const columns = [
    { key: 'id', header: 'Customer ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Contact' },
    { key: 'address', header: 'Address' },
    { key: 'purchases', header: 'Purchases' },
    { key: 'status', header: 'Status', render: (r: Customer) => (
      <span className={`${s.badge} ${r.status === 'Active' ? s.badgeSuccess : s.badgeMuted}`}>{r.status}</span>
    )},
  ]

  return (
    <AdminPageShell title="Customer Management" subtitle="Manage customers, purchase history and analytics"
      actions={<button className={s.btnPrimary} onClick={() => setModal(true)}><UserPlus size={15} /> Add Customer</button>}>
      <DataTable columns={columns} data={customers} searchKeys={['name', 'email', 'id']}
        filters={[{ key: 'status', label: 'All Status', options: ['Active', 'Inactive'] }]}
        actions={(row: Customer) => (
          <>
            <button className={s.btnIcon} onClick={() => show(`Viewing history for ${row.name}`)}>History</button>
            <button className={s.btnIcon} onClick={() => setModal(true)}>Edit</button>
            <button className={s.btnDanger} onClick={() => { setCustomers(c => c.filter(x => x.id !== row.id)); show('Customer deleted') }}>Delete</button>
          </>
        )}
      />
      {modal && (
        <div className={s.modalOverlay} onClick={() => setModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>Add Customer</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}><label className={s.formLabel}>Name</label><input className={s.formInput} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Email</label><input className={s.formInput} type="email" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Phone</label><input className={s.formInput} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Address</label><input className={s.formInput} /></div>
            </div>
            <div className={s.modalActions}>
              <button className={s.btnSecondary} onClick={() => setModal(false)}>Cancel</button>
              <button className={s.btnPrimary} onClick={() => { setModal(false); show('Customer saved') }}>Save</button>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </AdminPageShell>
  )
}
