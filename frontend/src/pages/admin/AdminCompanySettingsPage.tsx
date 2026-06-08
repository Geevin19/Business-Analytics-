import AdminPageShell from '@/components/admin/AdminPageShell'
import { useToast } from '@/components/admin/useToast'
import s from '@/components/admin/admin.module.css'

export default function AdminCompanySettingsPage() {
  const { show, Toast } = useToast()

  return (
    <AdminPageShell title="Company Settings" subtitle="Manage company profile and contact information">
      <div className={s.card}>
        <div className={s.formGrid}>
          <div className={s.formGroup}><label className={s.formLabel}>Company Name</label><input className={s.formInput} defaultValue="BizAnalytics Inc." /></div>
          <div className={s.formGroup}><label className={s.formLabel}>Email Address</label><input className={s.formInput} type="email" defaultValue="contact@bizanalytics.com" /></div>
          <div className={s.formGroup}><label className={s.formLabel}>Phone</label><input className={s.formInput} defaultValue="+1 (555) 000-0000" /></div>
          <div className={s.formGroup}><label className={s.formLabel}>Tax ID</label><input className={s.formInput} defaultValue="TAX-2026-001" /></div>
          <div className={s.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={s.formLabel}>Company Address</label>
            <input className={s.formInput} defaultValue="100 Analytics Blvd, Suite 500, New York, NY 10001" />
          </div>
          <div className={s.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={s.formLabel}>Company Logo</label>
            <input className={s.formInput} type="file" accept="image/*" />
          </div>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <button className={s.btnPrimary} onClick={() => show('Company settings saved')}>Save Changes</button>
        </div>
      </div>
      {Toast}
    </AdminPageShell>
  )
}
