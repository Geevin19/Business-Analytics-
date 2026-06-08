import { useState } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import DataTable from '@/components/admin/DataTable'
import { useToast } from '@/components/admin/useToast'
import { mockRoles, Role } from '@/data/adminMockData'
import { Shield, Plus } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

export default function AdminRolesPage() {
  const [roles, setRoles] = useState(mockRoles)
  const { show, Toast } = useToast()

  const columns = [
    { key: 'name', header: 'Role Name' },
    { key: 'permissions', header: 'Permissions' },
    { key: 'users', header: 'Assigned Users' },
  ]

  return (
    <AdminPageShell title="Roles & Permissions" subtitle="Create roles and manage access control"
      actions={<button className={s.btnPrimary} onClick={() => show('Create role form')}><Plus size={15} /> Create Role</button>}>
      <div className={s.grid3} style={{ marginBottom: '1.5rem' }}>
        {['Super Admin', 'Admin', 'Manager', 'Analyst'].map(r => (
          <div key={r} className={s.card} style={{ textAlign: 'center' }}>
            <Shield size={24} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 600 }}>{r}</div>
          </div>
        ))}
      </div>
      <DataTable columns={columns} data={roles} searchKeys={['name']}
        actions={(row: Role) => (
          <>
            <button className={s.btnIcon} onClick={() => show(`Editing role ${row.name}`)}>Edit</button>
            <button className={s.btnIcon} onClick={() => show(`Permissions assigned for ${row.name}`)}>Permissions</button>
            <button className={s.btnDanger} onClick={() => { setRoles(r => r.filter(x => x.id !== row.id)); show('Role deleted') }}>Delete</button>
          </>
        )}
      />
      {Toast}
    </AdminPageShell>
  )
}
