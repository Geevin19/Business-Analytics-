import { useTheme } from '@/context/ThemeContext'
import AdminPageShell from '@/components/admin/AdminPageShell'
import { useToast } from '@/components/admin/useToast'
import s from '@/components/admin/admin.module.css'

export default function AdminSystemSettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { show, Toast } = useToast()

  return (
    <AdminPageShell title="System Settings" subtitle="Theme, email, backup, security and notification configuration">
      <div className={s.grid2}>
        <div className={s.card}>
          <div className={s.cardTitle}>Theme Management</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Current theme: <strong>{theme}</strong>
          </p>
          <button className={s.btnSecondary} onClick={toggleTheme}>
            Toggle Dark Mode
          </button>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Email Configuration</div>
          <div className={s.formGroup}><label className={s.formLabel}>SMTP Host</label><input className={s.formInput} defaultValue="smtp.bizanalytics.com" /></div>
          <div className={s.formGroup}><label className={s.formLabel}>SMTP Port</label><input className={s.formInput} defaultValue="587" /></div>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Backup Configuration</div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Backup Frequency</label>
            <select className={s.formInput} defaultValue="daily"><option>Daily</option><option>Weekly</option></select>
          </div>
          <button className={s.btnSecondary} onClick={() => show('Backup started')}>Run Backup Now</button>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Notification Settings</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <input type="checkbox" defaultChecked /> Email notifications
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <input type="checkbox" defaultChecked /> In-app alerts
          </label>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button className={s.btnPrimary} onClick={() => show('System settings saved')}>Save All Settings</button>
      </div>
      {Toast}
    </AdminPageShell>
  )
}
