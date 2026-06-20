import { useState, useEffect } from 'react'
import { TrendingUp, Search, Download, RefreshCw, MoreHorizontal, ArrowUpRight, MapPin } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '@/services/api'
import styles from '../analytics/AnalyticsPage.module.css'

const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' } }
const axis = { axisLine: false as const, tickLine: false as const }

export default function TrendsPage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')
  const [trends, setTrends] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [salesRes, customersRes] = await Promise.all([
          api.get('/sales').then(r => r.data).catch(() => []),
          api.get('/customers').then(r => r.data).catch(() => []),
        ])
        if (!mounted) return

        const weekData: any[] = []
        const now = new Date()
        for (let w = 5; w >= 0; w--) {
          const weekStart = new Date(now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000)
          const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000)
          const weekSales = (salesRes || []).filter((s: any) => {
            const d = new Date(s.sale_date)
            return d >= weekStart && d < weekEnd
          })
          weekData.push({
            week: `W${6 - w}`,
            mobile: Math.round(weekSales.length * 0.45),
            desktop: Math.round(weekSales.length * 0.40),
            tablet: Math.round(weekSales.length * 0.15),
          })
        }
        setTrends(weekData)

        const totalSales = (salesRes || []).length
        const totalCustomers = (customersRes || []).length
        const totalSessions = totalSales + totalCustomers
        setKpis([
          { label: 'Mobile Sessions', value: String(Math.round(totalSessions * 0.45)), change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Desktop Sessions', value: String(Math.round(totalSessions * 0.40)), change: '', up: false, iconBg: '#fef3c7', iconColor: '#d97706' },
          { label: 'Avg. Order Value', value: '$0', change: '', up: false, iconBg: '#f3e8ff', iconColor: '#9333ea' },
          { label: 'Total Sessions', value: totalSessions.toLocaleString(), change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Tablet Sessions', value: String(Math.round(totalSessions * 0.15)), change: '', up: true, iconBg: '#dbeafe', iconColor: '#2563eb' },
          { label: 'Bounce Rate', value: '0%', change: '', up: true, iconBg: '#d1fae5', iconColor: '#059669' },
          { label: 'Avg. Duration', value: '0m', change: '', up: true, iconBg: '#ede9fe', iconColor: '#7c3aed' },
          { label: 'Trend Score', value: '0/10', change: '', up: true, iconBg: '#fee2e2', iconColor: '#dc2626' },
        ])
      } catch (e) {
        console.error('Failed to load trends data', e)
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
            <h1 className={styles.title}>AI Trend Prediction</h1>
            <span className={styles.growthBadge}>+8.1%</span>
          </div>
          <p className={styles.subtitle}>AI Module · Emerging patterns and behavioral trends</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}><Search size={14} className={styles.searchIcon} /><input placeholder="Search data..." className={styles.searchInput} /></div>
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
          <div className={styles.chartGroup}>
            <span className={styles.chartLabel}>CHART</span>
            {['Area','Bar','Line','Pie'].map(c => (
              <button key={c} className={`${styles.chartToggleBtn} ${chartType === c ? styles.chartActive : ''}`} onClick={() => setChartType(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.kpiRow}>
        {kpis.length === 0 && !loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No trend data available. Add sales and customer data to see trends.</div>
        ) : (
          kpis.map(k => (
            <div key={k.label} className={styles.kpiCard}>
              <div className={styles.kpiIconWrap} style={{ background: k.iconBg, color: k.iconColor }}><TrendingUp size={16} /></div>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={styles.kpiValue}>{k.value}</span>
              {k.change && <span className={`${styles.kpiChange} ${k.up ? styles.up : styles.down}`}>
                <ArrowUpRight size={12} /> {k.change} vs last period
              </span>}
            </div>
          ))
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Device Usage Trends — Area Chart</h3>
              <p className={styles.cardSub}>Showing {period.toLowerCase()} data</p>
            </div>
            <div className={styles.cardLegend}>
              <span className={styles.legendDot} style={{ background: '#16a34a' }} /> Mobile
              <span className={styles.legendDot} style={{ background: '#22c55e' }} /> Desktop
              <span className={styles.legendDot} style={{ background: '#10b981' }} /> Tablet
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trends.length > 0 ? trends : []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="mobile" stroke="#16a34a" fill="rgba(22,163,74,0.12)" strokeWidth={2} name="Mobile" />
              <Area type="monotone" dataKey="desktop" stroke="#22c55e" fill="rgba(34,197,94,0.12)" strokeWidth={2} name="Desktop" />
              <Area type="monotone" dataKey="tablet" stroke="#10b981" fill="rgba(16,185,129,0.12)" strokeWidth={2} name="Tablet" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>AI-Detected Insights</h3>
            <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-2)', borderRadius: 8, borderLeft: '3px solid #16a34a' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0, marginTop: 5 }} />
              <span style={{ fontSize: '0.845rem', color: 'var(--text-2)', lineHeight: 1.5 }}>Trend analysis based on your sales and customer data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}