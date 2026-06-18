import { useState, useEffect } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import DataTable from '@/components/admin/DataTable'
import { useToast } from '@/components/admin/useToast'
import { AdminUser } from '@/data/adminMockData'
import { getAdminUsers } from '@/services/admin.service'
import { UserPlus } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

function statusBadge(status: string) {
  return <span className={`${s.badge} ${status === 'Active' ? s.badgeSuccess : s.badgeMuted}`}>{status}</span>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    getAdminUsers().then(data => {
      if (mounted) {
        // Map profiles from backend to AdminUser format
        const mapped: AdminUser[] = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name || p.email?.split('@')[0] || 'Unknown',
          email: p.email || '',
          phone: p.phone || '',
          role: p.role || 'USER',
          status: p.status || 'Active',
          lastLogin: p.last_login || p.created_at || '',
        }))
        setUsers(mapped)
      }
    }).catch(() => {}).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const { show, Toast } = useToast()

  const columns = [
    { key: 'id', header: 'User ID' },
    { key: 'name', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status', render: (r: AdminUser) => statusBadge(r.status) },
    { key: 'lastLogin', header: 'Last Login' },
  ]

  const toggleStatus = (user: AdminUser) => {
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Inactive' as const : 'Active' as const } : u
    ))
    show(`User ${user.name} ${user.status === 'Active' ? 'deactivated' : 'activated'}`)
  }

  return (
    <AdminPageShell
      title="User Management"
      subtitle="View, add, edit, and manage user accounts and roles"
      actions={
        <button className={s.btnPrimary} onClick={() => { setEditing(null); setModal('add') }}>
          <UserPlus size={15} /> Add User
        </button>
      }
    >
      <DataTable
        columns={columns}
        data={users}
        searchKeys={['name', 'email', 'role', 'id']}
        searchPlaceholder="Search users..."
        filters={[
          { key: 'role', label: 'All Roles', options: ['ADMIN', 'MANAGER', 'USER'] },
          { key: 'status', label: 'All Status', options: ['Active', 'Inactive'] },
        ]}
        actions={(row: AdminUser) => (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button className={s.btnIcon} onClick={() => { setEditing(row); setModal('edit') }}>Edit</button>
            <button className={s.btnIcon} onClick={() => toggleStatus(row)}>
              {row.status === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
            <button className={s.btnIcon} onClick={() => show(`Password reset sent to ${row.email}`)}>Reset PW</button>
            <button className={s.btnDanger} onClick={() => { setUsers(u => u.filter(x => x.id !== row.id)); show('User deleted') }}>Delete</button>
          </div>
        )}
      />

      {modal && (
        <div className={s.modalOverlay} onClick={() => setModal(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>{modal === 'add' ? 'Add New User' : 'Edit User'}</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}><label className={s.formLabel}>Full Name</label><input className={s.formInput} defaultValue={editing?.name} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Email</label><input className={s.formInput} type="email" defaultValue={editing?.email} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Phone</label><input className={s.formInput} defaultValue={editing?.phone} /></div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Role</label>
                <select className={s.formInput} defaultValue={editing?.role ?? 'USER'}>
                  {['ADMIN', 'MANAGER', 'USER'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className={s.modalActions}>
              <button className={s.btnSecondary} onClick={() => setModal(null)}>Cancel</button>
              <button className={s.btnPrimary} onClick={() => { setModal(null); show(modal === 'add' ? 'User created' : 'User updated') }}>Save</button>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </AdminPageShell>
  )
}