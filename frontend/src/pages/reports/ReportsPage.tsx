import { useState, useEffect } from 'react'
import { Download, FilePlus, Clock, Search, RefreshCw, ArrowUpRight, MapPin, FileText } from 'lucide-react'
import api from '@/services/api'
import styles from '../analytics/AnalyticsPage.module.css'

export default function ReportsPage() {
  const [period, setPeriod] = useState('All Time')
  const [reports, setReports] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const reportsRes = await api.get('/reports').then(r => r.data).catch(() => [])
        if (!mounted) return
        
        setReports(reportsRes || [])
        
        const totalReports = (reportsRes || []).length
        const pdfReports = (reportsRes || []).filter((r: any) => r.type === 'PDF').length
        const excelReports = (reportsRes || []).filter((r: any) => r.type === 'Excel').length
        
        setKpis([
          { label: 'Total Reports', value: String(totalReports), change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'PDF Reports', value: String(pdfReports), change: '', up: true, iconBg: '#fee2e2', iconColor: '#dc2626' },
          { label: 'Excel Reports', value: String(excelReports), change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Scheduled', value: '0', change: '', up: true, iconBg: '#dbeafe', iconColor: '#2563eb' },
          { label: 'Delivered Today', value: '0', change: '', up: true, iconBg: '#d1fae5', iconColor: '#059669' },
          { label: 'Pending', value: '0', change: '', up: false, iconBg: '#fef3c7', iconColor: '#d97706' },
          { label: 'Total Size', value: '0 MB', change: '', up: true, iconBg: '#ede9fe', iconColor: '#7c3aed' },
          { label: 'Avg. Gen Time', value: '0s', change: '', up: true, iconBg: '#f3e8ff', iconColor: '#9333ea' },
        ])
      } catch (e) {
        console.error('Failed to load reports', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Reports</h1>
            <span className={styles.growthBadge}>5 reports</span>
          </div>
          <p className={styles.subtitle}>Reports Module · Generate, export and schedule business reports</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}><Search size={14} className={styles.searchIcon} /><input placeholder="Search reports..." className={styles.searchInput} /></div>
          <button className={styles.actionBtn}><FilePlus size={15} /> Generate PDF</button>
          <button className={styles.actionBtn} style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}><FilePlus size={15} /> Generate Excel</button>
          <button className={styles.actionBtn}><Clock size={15} /> Schedule</button>
          <button className={styles.actionBtnPrimary}><Download size={15} /> Export All</button>
        </div>
      </div>

      <div className={styles.filterToolbar}>
        <div className={styles.filterTabs}>
          {['All Time','Today','Week','Month','Year'].map(p => (
            <button key={p} className={`${styles.filterTab} ${period === p ? styles.active : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
        <div className={styles.filterActions}>
          <div className={styles.locationLabel}><MapPin size={12} /> TYPE</div>
          <select className={styles.filterSelect}><option>All Types</option><option>PDF</option><option>Excel</option></select>
        </div>
      </div>

      <div className={styles.kpiRow}>
        {kpis.length === 0 && !loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No reports available. Generate reports to see statistics.</div>
        ) : (
          kpis.map(k => (
            <div key={k.label} className={styles.kpiCard}>
              <div className={styles.kpiIconWrap} style={{ background: k.iconBg, color: k.iconColor }}><FileText size={16} /></div>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={styles.kpiValue}>{k.value}</span>
              {k.change && (
                <span className={`${styles.kpiChange} ${k.up ? styles.up : styles.down}`}>
                  <ArrowUpRight size={12} /> {k.change} vs last period
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <h3>Recent Reports</h3>
          <button className={styles.actionBtnPrimary} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}><Download size={13} /> Download All</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.855rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
              {['Report Name', 'Date', 'Type', 'Size', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', color: 'var(--text-faint)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No reports generated yet. Create your first report to get started.
                </td>
              </tr>
            ) : (
              reports.map(r => (
                <tr key={r.name} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: 'var(--text)' }}>{r.name}</td>
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)' }}>{r.date}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span style={{ padding: '0.18rem 0.5rem', background: r.type === 'PDF' ? '#fee2e2' : '#dcfce7', color: r.type === 'PDF' ? '#dc2626' : '#16a34a', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>{r.type}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-faint)' }}>{r.size}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <button style={{ padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Download size={13} /> Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}