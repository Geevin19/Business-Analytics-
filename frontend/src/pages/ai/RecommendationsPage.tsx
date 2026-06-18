import { useState, useEffect } from 'react'
import { Search, Download, RefreshCw, ArrowUpRight, MapPin, Zap } from 'lucide-react'
import api from '@/services/api'
import styles from '../analytics/AnalyticsPage.module.css'

const priorityStyle: Record<string, { bg: string; color: string; border: string }> = {
  High: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Medium: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Low: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
}

export default function RecommendationsPage() {
  const [period, setPeriod] = useState('All Time')
  const [recs, setRecs] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [salesRes, customersRes, productsRes] = await Promise.all([
          api.get('/sales').then(r => r.data).catch(() => []),
          api.get('/customers').then(r => r.data).catch(() => []),
          api.get('/products').then(r => r.data).catch(() => []),
        ])
        if (!mounted) return

        const recommendations: any[] = []
        const totalCustomers = (customersRes || []).length
        const totalSales = (salesRes || []).length
        const totalProducts = (productsRes || []).length
        
        if (totalSales > 0) {
          recommendations.push({
            title: 'Analyze Sales Performance',
            desc: `You have ${totalSales} sales recorded. Review top-performing products and optimize marketing.`,
            priority: 'High',
          })
        }
        
        if (totalCustomers > 0) {
          recommendations.push({
            title: 'Customer Engagement',
            desc: `${totalCustomers} customers in database. Implement loyalty program to increase retention.`,
            priority: 'High',
          })
        }
        
        if (totalProducts > 0) {
          recommendations.push({
            title: 'Product Portfolio Review',
            desc: `${totalProducts} products available. Analyze performance metrics to identify top sellers.`,
            priority: 'Medium',
          })
        }
        
        recommendations.push({
          title: 'Data-Driven Decisions',
          desc: 'Continue collecting and analyzing data to improve business insights and forecasting accuracy.',
          priority: 'Medium',
        })
        
        setRecs(recommendations)

        const highPriority = recommendations.filter(r => r.priority === 'High').length
        const mediumPriority = recommendations.filter(r => r.priority === 'Medium').length
        const lowPriority = recommendations.filter(r => r.priority === 'Low').length
        
        setKpis([
          { label: 'High Priority', value: String(highPriority), change: '', up: true, iconBg: '#fee2e2', iconColor: '#dc2626' },
          { label: 'Medium Priority', value: String(mediumPriority), change: '', up: true, iconBg: '#fef3c7', iconColor: '#d97706' },
          { label: 'Low Priority', value: String(lowPriority), change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Total Recommendations', value: String(recommendations.length), change: '', up: true, iconBg: '#dbeafe', iconColor: '#2563eb' },
          { label: 'Revenue Impact', value: '$0', change: '', up: true, iconBg: '#d1fae5', iconColor: '#059669' },
          { label: 'Actions Taken', value: '0', change: '', up: true, iconBg: '#ede9fe', iconColor: '#7c3aed' },
          { label: 'Pending Actions', value: String(recommendations.length), change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'AI Confidence', value: '0%', change: '', up: true, iconBg: '#f3e8ff', iconColor: '#9333ea' },
        ])
      } catch (e) {
        console.error('Failed to load recommendations', e)
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
        {kpis.length === 0 && !loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No recommendations available. Add business data to generate insights.</div>
        ) : (
          kpis.map(k => (
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
          ))
        )}
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
