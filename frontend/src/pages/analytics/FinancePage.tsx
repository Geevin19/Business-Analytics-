import { useState } from 'react'
import { DollarSign, ArrowUpRight, TrendingUp, PieChart as PieIcon, Search, Download, RefreshCw, MoreHorizontal, MapPin } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styles from './AnalyticsPage.module.css'

const cashFlow = [
  { month: 'Jan', inflow: 52, outflow: 38 }, { month: 'Feb', inflow: 58, outflow: 42 },
  { month: 'Mar', inflow: 61, outflow: 40 }, { month: 'Apr', inflow: 55, outflow: 44 },
  { month: 'May', inflow: 68, outflow: 46 }, { month: 'Jun', inflow: 74, outflow: 48 },
  { month: 'Jul', inflow: 71, outflow: 47 }, { month: 'Aug', inflow: 80, outflow: 50 },
  { month: 'Sep', inflow: 86, outflow: 52 }, { month: 'Oct', inflow: 92, outflow: 55 },
  { month: 'Nov', inflow: 89, outflow: 53 }, { month: 'Dec', inflow: 96, outflow: 58 },
]

const byRegion = [
  { region: 'North', value: 96000 },
  { region: 'South', value: 74000 },
  { region: 'East', value: 61000 },
  { region: 'West', value: 48000 },
  { region: 'Capital', value: 32000 },
]

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }

const kpis = [
  { label: 'Total Revenue', value: '$1.1M', change: '+18%', up: true, icon: <DollarSign size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Gross Profit', value: '$527K', change: '+22%', up: true, icon: <TrendingUp size={16} />, iconBg: '#dbeafe', iconColor: '#2563eb' },
  { label: 'Avg. Order Value', value: '$674.54', change: '-2.3%', up: false, icon: <DollarSign size={16} />, iconBg: '#f3e8ff', iconColor: '#9333ea' },
  { label: 'Net Profit', value: '$455.0K', change: '+12.4%', up: true, icon: <TrendingUp size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
  { label: 'Total Expenses', value: '$573K', change: '+8%', up: false, icon: <ArrowUpRight size={16} />, iconBg: '#ffedd5', iconColor: '#f97316' },
  { label: 'Monthly Recurring', value: '$3.10K', change: '+18.9%', up: true, icon: <DollarSign size={16} />, iconBg: '#d1fae5', iconColor: '#059669' },
  { label: 'Total Transactions', value: '2.38K', change: '+6.4%', up: true, icon: <PieIcon size={16} />, iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { label: 'Budget Used', value: '72%', change: '+3%', up: false, icon: <PieIcon size={16} />, iconBg: '#fee2e2', iconColor: '#dc2626' },
]

export default function FinancePage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')

  return (
    <div className={styles.page}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Analysis: Finance</h1>
            <span className={styles.growthBadge}>+18%</span>
          </div>
          <p className={styles.subtitle}>Finance Module · Jan 2025 – Dec 2025</p>
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
              <h3>Analysis: Finance — Cash Flow</h3>
              <p className={styles.cardSub}>Showing {period.toLowerCase()} data</p>
            </div>
            <div className={styles.cardLegend}>
              <span className={styles.legendDot} style={{ background: '#16a34a' }} /> Inflow
              <span className={styles.legendDot} style={{ background: '#f43f5e' }} /> Outflow
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cashFlow}>
              <defs>
                <linearGradient id="fin1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fin2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} formatter={(v: number) => `$${v}K`} />
              <Area type="monotone" dataKey="inflow" stroke="#16a34a" fill="url(#fin1)" strokeWidth={2} name="Inflow" />
              <Area type="monotone" dataKey="outflow" stroke="#f43f5e" fill="url(#fin2)" strokeWidth={2} name="Outflow" />
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
              <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
