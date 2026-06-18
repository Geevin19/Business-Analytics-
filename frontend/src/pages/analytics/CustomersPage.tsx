import { useState } from 'react'
import { Users, UserPlus, RefreshCw as RefreshCwIcon, UserMinus, Search, Download, RefreshCw, MoreHorizontal, ArrowUpRight, MapPin } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styles from './AnalyticsPage.module.css'

const growth = [
  { month: 'Jan', total: 8200, returning: 5000 }, { month: 'Feb', total: 8800, returning: 5400 },
  { month: 'Mar', total: 9400, returning: 5800 }, { month: 'Apr', total: 9900, returning: 6100 },
  { month: 'May', total: 10500, returning: 6500 }, { month: 'Jun', total: 11000, returning: 6800 },
  { month: 'Jul', total: 11400, returning: 7000 }, { month: 'Aug', total: 11800, returning: 7300 },
  { month: 'Sep', total: 12100, returning: 7500 }, { month: 'Oct', total: 12300, returning: 7600 },
  { month: 'Nov', total: 12420, returning: 7700 }, { month: 'Dec', total: 12491, returning: 7750 },
]

const byRegion = [
  { region: 'North', value: 4200 },
  { region: 'South', value: 3100 },
  { region: 'East', value: 2800 },
  { region: 'West', value: 1900 },
  { region: 'Capital', value: 491 },
]

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }

const kpis = [
  { label: 'Total Customers', value: '1.48K', change: '+8.2%', up: true, icon: <Users size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'New Customers', value: '1.30K', change: '+3.1%', up: true, icon: <UserPlus size={16} />, iconBg: '#dbeafe', iconColor: '#2563eb' },
  { label: 'Avg. Order Value', value: '$674.54', change: '-2.3%', up: false, icon: <UserMinus size={16} />, iconBg: '#f3e8ff', iconColor: '#9333ea' },
  { label: 'Total Revenue', value: '$455.0K', change: '+12.4%', up: true, icon: <Users size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Orders', value: '720', change: '+5.7%', up: true, icon: <Users size={16} />, iconBg: '#ffedd5', iconColor: '#f97316' },
  { label: 'Monthly Recurring', value: '$3.10K', change: '+18.9%', up: true, icon: <RefreshCwIcon size={16} />, iconBg: '#d1fae5', iconColor: '#059669' },
  { label: 'Total Transactions', value: '2.38K', change: '+6.4%', up: true, icon: <Users size={16} />, iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { label: 'Churn Rate', value: '12.0%', change: '-2.1%', up: true, icon: <UserMinus size={16} />, iconBg: '#fee2e2', iconColor: '#dc2626' },
]

export default function CustomersPage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')

  return (
    <div className={styles.page}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Analysis: Customers</h1>
            <span className={styles.growthBadge}>+8.2%</span>
          </div>
          <p className={styles.subtitle}>CRM Module · Jan 2025 – Dec 2025</p>
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
            <div className={styles.kpiIconWrap} style={{ background: k.iconBg, color: k.iconColor }}>{k.icon}</div>
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
              <h3>Analysis: Customers — Area Chart</h3>
              <p className={styles.cardSub}>Showing {period.toLowerCase()} data</p>
            </div>
            <div className={styles.cardLegend}>
              <span className={styles.legendDot} style={{ background: '#16a34a' }} /> Total
              <span className={styles.legendDot} style={{ background: '#22c55e' }} /> Returning
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growth}>
              <defs>
                <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} />
              <Area type="monotone" dataKey="total" stroke="#16a34a" fill="url(#cg1)" strokeWidth={2} name="Total" />
              <Area type="monotone" dataKey="returning" stroke="#22c55e" fill="url(#cg2)" strokeWidth={2} strokeDasharray="5 3" name="Returning" />
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
