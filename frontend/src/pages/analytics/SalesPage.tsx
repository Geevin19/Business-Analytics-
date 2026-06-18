import { useState } from 'react'
import { TrendingUp, ShoppingCart, Calendar, Award, Search, Download, RefreshCw, MoreHorizontal, ArrowUpRight, MapPin } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styles from './AnalyticsPage.module.css'

const monthly = [
  { month: 'Jan', sales: 3200, returning: 1800 }, { month: 'Feb', sales: 4100, returning: 2200 },
  { month: 'Mar', sales: 3800, returning: 2000 }, { month: 'Apr', sales: 5200, returning: 2900 },
  { month: 'May', sales: 4900, returning: 2700 }, { month: 'Jun', sales: 6100, returning: 3400 },
  { month: 'Jul', sales: 5800, returning: 3200 }, { month: 'Aug', sales: 6800, returning: 3800 },
  { month: 'Sep', sales: 7200, returning: 4000 }, { month: 'Oct', sales: 7800, returning: 4300 },
  { month: 'Nov', sales: 7400, returning: 4100 }, { month: 'Dec', sales: 8200, returning: 4600 },
]

const byRegion = [
  { region: 'North', value: 8400 },
  { region: 'South', value: 6200 },
  { region: 'East', value: 5100 },
  { region: 'West', value: 3800 },
  { region: 'Capital', value: 2900 },
]

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }

const kpis = [
  { label: 'Today', value: '$4,280', change: '+6%', up: true, icon: <TrendingUp size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'New Orders', value: '1.30K', change: '+3.1%', up: true, icon: <ShoppingCart size={16} />, iconBg: '#dbeafe', iconColor: '#2563eb' },
  { label: 'Avg. Order Value', value: '$674.54', change: '-2.3%', up: false, icon: <Award size={16} />, iconBg: '#f3e8ff', iconColor: '#9333ea' },
  { label: 'Total Revenue', value: '$455.0K', change: '+12.4%', up: true, icon: <TrendingUp size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'This Week', value: '$28,400', change: '+4%', up: true, icon: <Calendar size={16} />, iconBg: '#ffedd5', iconColor: '#f97316' },
  { label: 'This Month', value: '$94,200', change: '+12%', up: true, icon: <TrendingUp size={16} />, iconBg: '#d1fae5', iconColor: '#059669' },
  { label: 'Total Transactions', value: '2.38K', change: '+6.4%', up: true, icon: <ShoppingCart size={16} />, iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { label: 'This Year', value: '$1.1M', change: '+18%', up: true, icon: <Award size={16} />, iconBg: '#fee2e2', iconColor: '#dc2626' },
]

export default function SalesPage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerTop}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Analysis: Sales</h1>
            <span className={styles.growthBadge}>+12.4%</span>
          </div>
          <p className={styles.subtitle}>Sales Module · Jan 2025 – Dec 2025</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}><Search size={14} className={styles.searchIcon} /><input placeholder="Search data..." className={styles.searchInput} /></div>
          <button className={styles.actionBtn}><RefreshCw size={15} /> Refresh</button>
          <button className={styles.actionBtnPrimary}><Download size={15} /> Export</button>
        </div>
      </div>

      {/* Filter Bar */}
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

      {/* KPI Grid */}
      <div className={styles.kpiRow}>
        {kpis.map(k => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiIconWrap} style={{ background: k.iconBg, color: k.iconColor }}>{k.icon}</div>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={`${styles.kpiChange} ${k.up ? styles.up : styles.down}`}>
              <ArrowUpRight size={12} /> {k.change} vs last period
            </span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.mainContent}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Analysis: Sales — Area Chart</h3>
              <p className={styles.cardSub}>Showing {period.toLowerCase()} data</p>
            </div>
            <div className={styles.cardLegend}>
              <span className={styles.legendDot} style={{ background: '#16a34a' }} /> Total
              <span className={styles.legendDot} style={{ background: '#22c55e' }} /> Returning
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} />
              <Area type="monotone" dataKey="sales" stroke="#16a34a" fill="url(#sg1)" strokeWidth={2} name="Total" />
              <Area type="monotone" dataKey="returning" stroke="#22c55e" fill="url(#sg2)" strokeWidth={2} strokeDasharray="5 3" name="Returning" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}><h3>Regional Distribution</h3><button className={styles.moreBtn}><MoreHorizontal size={16} /></button></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={55} {...axis} />
              <Tooltip {...ttip} />
              <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
