import { useState } from 'react'
import { TrendingUp, Search, Download, RefreshCw, MoreHorizontal, ArrowUpRight, MapPin } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styles from '../analytics/AnalyticsPage.module.css'

const trends = [
  { week: 'W1', mobile: 420, desktop: 380, tablet: 120 },
  { week: 'W2', mobile: 480, desktop: 360, tablet: 130 },
  { week: 'W3', mobile: 510, desktop: 340, tablet: 140 },
  { week: 'W4', mobile: 560, desktop: 320, tablet: 150 },
  { week: 'W5', mobile: 600, desktop: 300, tablet: 145 },
  { week: 'W6', mobile: 650, desktop: 290, tablet: 155 },
]

const insights = [
  { text: 'Mobile usage growing 12% week-over-week', positive: true },
  { text: 'Desktop sessions declining — consider mobile-first UX improvements', positive: false },
  { text: 'Peak activity on Tuesday and Thursday afternoons', positive: true },
  { text: 'Cart abandonment up 4% — review checkout flow', positive: false },
]

const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' } }
const axis = { axisLine: false as const, tickLine: false as const }

const kpis = [
  { label: 'Mobile Sessions', value: '650', change: '+12%', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Desktop Sessions', value: '290', change: '-5.2%', up: false, iconBg: '#fef3c7', iconColor: '#d97706' },
  { label: 'Avg. Order Value', value: '$674.54', change: '-2.3%', up: false, iconBg: '#f3e8ff', iconColor: '#9333ea' },
  { label: 'Total Sessions', value: '1.09K', change: '+8.1%', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Tablet Sessions', value: '155', change: '+3.3%', up: true, iconBg: '#dbeafe', iconColor: '#2563eb' },
  { label: 'Bounce Rate', value: '34.2%', change: '-2.1%', up: true, iconBg: '#d1fae5', iconColor: '#059669' },
  { label: 'Avg. Duration', value: '4m 12s', change: '+0.8%', up: true, iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { label: 'Trend Score', value: '8.4/10', change: '+0.6', up: true, iconBg: '#fee2e2', iconColor: '#dc2626' },
]

export default function TrendsPage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')

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
        {kpis.map(k => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiIconWrap} style={{ background: k.iconBg, color: k.iconColor }}><TrendingUp size={16} /></div>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={`${styles.kpiChange} ${k.up ? styles.up : styles.down}`}>
              <ArrowUpRight size={12} /> {k.change} vs last period
            </span>
          </div>
        ))}
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
            <AreaChart data={trends}>
              <defs>
                {[['#16a34a','tg1'],['#22c55e','tg2'],['#10b981','tg3']].map(([c,id]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="mobile" stroke="#16a34a" fill="url(#tg1)" strokeWidth={2} name="Mobile" />
              <Area type="monotone" dataKey="desktop" stroke="#22c55e" fill="url(#tg2)" strokeWidth={2} name="Desktop" />
              <Area type="monotone" dataKey="tablet" stroke="#10b981" fill="url(#tg3)" strokeWidth={2} name="Tablet" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}><h3>AI-Detected Insights</h3><button className={styles.moreBtn}><MoreHorizontal size={16} /></button></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            {insights.map(i => (
              <div key={i.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-2)', borderRadius: 8, borderLeft: `3px solid ${i.positive ? '#16a34a' : '#94a3b8'}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: i.positive ? '#16a34a' : '#94a3b8', flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: '0.845rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{i.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
