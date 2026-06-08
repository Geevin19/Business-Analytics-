import AdminPageShell from '@/components/admin/AdminPageShell'
import { useToast } from '@/components/admin/useToast'
import s from '@/components/admin/admin.module.css'

export default function AdminSecurityPage() {
  const { show, Toast } = useToast()

  return (
    <AdminPageShell title="Security Management" subtitle="Password policies, sessions, 2FA and login monitoring">
      <div className={s.grid2}>
        <div className={s.card}>
          <div className={s.cardTitle}>Change Password</div>
          <div className={s.formGroup}><label className={s.formLabel}>Current Password</label><input className={s.formInput} type="password" /></div>
          <div className={s.formGroup}><label className={s.formLabel}>New Password</label><input className={s.formInput} type="password" /></div>
          <div className={s.formGroup}><label className={s.formLabel}>Confirm Password</label><input className={s.formInput} type="password" /></div>
          <button className={s.btnPrimary} onClick={() => show('Password updated')}>Update Password</button>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Password Policy</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <input type="checkbox" defaultChecked /> Minimum 8 characters
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <input type="checkbox" defaultChecked /> Require special characters
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <input type="checkbox" defaultChecked /> Lock account after 5 failed logins
          </label>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Two-Factor Authentication</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>2FA ready — enable for enhanced security.</p>
          <button className={s.btnSecondary} onClick={() => show('2FA setup wizard opened')}>Enable 2FA</button>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Session Management</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Active sessions: 2 devices</p>
          <button className={s.btnDanger} onClick={() => show('All sessions terminated')}>Logout All Sessions</button>
        </div>
      </div>
      {Toast}
    </AdminPageShell>
  )
}
