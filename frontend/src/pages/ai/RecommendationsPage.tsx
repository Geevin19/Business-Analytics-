import { useState } from 'react'
import { Search, Download, RefreshCw, ArrowUpRight, MapPin, Zap } from 'lucide-react'
import styles from '../analytics/AnalyticsPage.module.css'

const recs = [
  { title: 'Upsell Premium Plan', desc: '234 customers match the profile for premium upgrade. Expected revenue lift: $12,400/month.', priority: 'High' },
  { title: 'Re-engage Dormant Customers', desc: '890 customers have not purchased in 60+ days. A targeted email campaign is recommended.', priority: 'High' },
  { title: 'Restock Widget B and D', desc: 'Based on demand trends, both items will be out of stock within 14 days.', priority: 'Medium' },
  { title: 'Reduce Marketing Spend in Region West', desc: 'ROI in West region is 40% below average. Reallocate $8,000 to North region.', priority: 'Medium' },
  { title: 'Launch Weekend Flash Sale', desc: 'Historical data shows 38% higher conversion on weekends. Consider a 48-hour promotion.', priority: 'Low' },
  { title: 'Set Revenue Milestone Alert', desc: 'Revenue is tracking 8% above target. Set a $100k milestone notification.', priority: 'Low' },
]

const priorityStyle: Record<string, { bg: string; color: string; border: string }> = {
  High: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Medium: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Low: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
}

const kpis = [
  { label: 'High Priority', value: '2', change: '', up: true, iconBg: '#fee2e2', iconColor: '#dc2626' },
  { label: 'Medium Priority', value: '2', change: '', up: true, iconBg: '#fef3c7', iconColor: '#d97706' },
  { label: 'Low Priority', value: '2', change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Est. Revenue Lift', value: '$21.4K', change: '+12.4%', up: true, iconBg: '#dbeafe', iconColor: '#2563eb' },
  { label: 'Actions Taken', value: '3', change: '+1', up: true, iconBg: '#d1fae5', iconColor: '#059669' },
  { label: 'Pending Actions', value: '3', change: '', up: true, iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { label: 'AI Confidence', value: '88%', change: '+2.1%', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Last Updated', value: 'Today', change: '', up: true, iconBg: '#f3e8ff', iconColor: '#9333ea' },
]

export default function RecommendationsPage() {
  const [period, setPeriod] = useState('All Time')

  return (
    <div className={styles.page}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>AI Recommendation Engine</h1>
            <span className={styles.growthBadge}>6 actions</span>
          </div>
          <p className={styles.subtitle}>AI Module · Data-driven recommendations to grow your business</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}><Search size={14} className={styles.searchIcon} /><input placeholder="Search recommendations..." className={styles.searchInput} /></div>
          <button className={styles.actionBtn}><RefreshCw size={15} /> Refresh</button>
          <button className={styles.actionBtnPrimary}><Download size={15} /> Export</button>
        </div>
      </div>

      <div className={styles.filterToolbar}>
        <div className={styles.filterTabs}>
          {['All Time','Today','Week','Month','Year'].map(p => (
            <button key={p} className={`${styles.filterTab} ${period === p ? styles.active : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
        <div className={styles.filterActions}>
          <div className={styles.locationLabel}><MapPin size={12} /> PLACE</div>
          <select className={styles.filterSelect}><option>All Locations</option></select>
        </div>
      </div>

      <div className={styles.kpiRow}>
        {kpis.map(k => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiIconWrap} style={{ background: k.iconBg, color: k.iconColor }}><Zap size={16} /></div>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            {k.change && (
              <span className={`${styles.kpiChange} ${k.up ? styles.up : styles.down}`}>
                <ArrowUpRight size={12} /> {k.change} vs last period
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
        {recs.map(r => {
          const p = priorityStyle[r.priority]
          return (
            <div key={r.title} style={{ background: 'var(--surface)', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.3 }}>{r.title}</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.18rem 0.6rem', borderRadius: 20, background: p.bg, color: p.color, border: `1px solid ${p.border}`, flexShrink: 0 }}>
                  {r.priority}
                </span>
              </div>
              <p style={{ fontSize: '0.845rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
              <button style={{ marginTop: '0.25rem', padding: '0.4rem 0.875rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--primary)', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#dcfce7' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                Take Action
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
