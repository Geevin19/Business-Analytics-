import { useState } from 'react'
import { TrendingUp, Target, BarChart2, Search, Download, RefreshCw, MoreHorizontal, ArrowUpRight, MapPin } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import styles from '../analytics/AnalyticsPage.module.css'

const data = [
  { month: 'Jan', actual: 42 }, { month: 'Feb', actual: 48 }, { month: 'Mar', actual: 55 },
  { month: 'Apr', actual: 51 }, { month: 'May', actual: 63 }, { month: 'Jun', actual: 71 },
  { month: 'Jul', actual: 68 }, { month: 'Aug', actual: 78 }, { month: 'Sep', actual: 82 },
  { month: 'Oct', actual: 90, forecast: 90 }, { month: 'Nov', forecast: 96 },
  { month: 'Dec', forecast: 103 }, { month: 'Jan+1', forecast: 108 },
]

const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' } }
const axis = { axisLine: false as const, tickLine: false as const }

const kpis = [
  { label: 'Next Month Forecast', value: '$103,000', change: '+14.4%', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Forecast Accuracy', value: '94.2%', change: '+1.2%', up: true, iconBg: '#dbeafe', iconColor: '#2563eb' },
  { label: 'Q1 Growth Projection', value: '+16%', change: '+3%', up: true, iconBg: '#f3e8ff', iconColor: '#9333ea' },
  { label: 'Confidence Level', value: '91%', change: '+2.1%', up: true, iconBg: '#d1fae5', iconColor: '#059669' },
  { label: 'Revenue at Risk', value: '$12K', change: '-4.2%', up: true, iconBg: '#fee2e2', iconColor: '#dc2626' },
  { label: 'Trend Direction', value: 'Upward', change: '+8.2%', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Forecast Horizon', value: '6 months', change: '', up: true, iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { label: 'Model Version', value: 'v2.4', change: 'Updated', up: true, iconBg: '#fef3c7', iconColor: '#d97706' },
]

export default function ForecastingPage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')

  return (
    <div className={styles.page}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>AI Sales Forecasting</h1>
            <span className={styles.growthBadge}>94.2% accuracy</span>
          </div>
          <p className={styles.subtitle}>AI Module · Revenue predictions based on historical trends</p>
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
            {k.change && (
              <span className={`${styles.kpiChange} ${k.up ? styles.up : styles.down}`}>
                <ArrowUpRight size={12} /> {k.change} vs last period
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Revenue Forecast — Area Chart</h3>
              <p className={styles.cardSub}>Solid = actual · Dashed = AI forecast</p>
            </div>
            <div className={styles.cardLegend}>
              <span className={styles.legendDot} style={{ background: '#16a34a' }} /> Actual
              <span className={styles.legendDot} style={{ background: '#22c55e' }} /> Forecast
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} formatter={(v: number) => `$${v}K`} />
              <ReferenceLine x="Oct" stroke="var(--border)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="actual" stroke="#16a34a" fill="url(#fg1)" strokeWidth={2} name="Actual" />
              <Area type="monotone" dataKey="forecast" stroke="#22c55e" fill="url(#fg2)" strokeWidth={2} strokeDasharray="6 3" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}><h3>Regional Forecast</h3><button className={styles.moreBtn}><MoreHorizontal size={16} /></button></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {[['North', 85, '#16a34a'], ['South', 72, '#22c55e'], ['East', 64, '#10b981'], ['West', 48, '#059669']].map(([r, v, c]) => (
              <div key={r as string}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{r}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>{v}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${v}%`, background: c as string, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
