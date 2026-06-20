import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign, Users, ShoppingCart,
  ArrowUpRight, ArrowDownLeft, Activity, BarChart3,
  CheckCircle2, Clock, MoreHorizontal, TrendingUp,
  MapPin, Search, Bell, Download, RefreshCcw
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import styles from './DashboardPage.module.css'
import { getDashboard, getSales } from '@/services/admin.service'
import api from '@/services/api'

const SURVEY_COLORS = ['#16a34a', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6']
const ttip = { contentStyle: { borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 } }
const axis = { axisLine: false as const, tickLine: false as const }

// Static fallback location data
const LOCATION_DATA = [
  { location: 'North', revenue: 8400, orders: 420, customers: 310 },
  { location: 'South', revenue: 6200, orders: 310, customers: 240 },
  { location: 'East', revenue: 5100, orders: 255, customers: 198 },
  { location: 'West', revenue: 3800, orders: 190, customers: 147 },
  { location: 'Capital', revenue: 2900, orders: 145, customers: 112 },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')
  const [kpis, setKpis] = useState<any>({})
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [salesByRegion, setSalesByRegion] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState<'all' | 'us' | 'eu' | 'asia'>('all')
  const [selectedChart, setSelectedChart] = useState<'Area' | 'Bar' | 'Line' | 'Pie'>('Area')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadDashboard = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [db, summary, sales] = await Promise.all([
        getDashboard().catch(() => null),
        api.get('/sales/summary').then((r) => r.data).catch(() => null),
        getSales().catch(() => null),
      ])

      if (db) setKpis(db)
      if (summary) setSalesByRegion(summary.byRegion || [])

      if (sales && Array.isArray(sales)) {
        setRecentTransactions(
          sales.slice(0, 5).map((s: any) => ({
            id: s.id || '#INV',
            customer: s.customers?.name || 'Unknown',
            amount: Number(s.total) || 0,
            status: 'Completed',
            date: s.sale_date ? new Date(s.sale_date).toLocaleDateString() : '',
          }))
        )

        const monthMap: Record<string, { revenue: number; expenses: number }> = {}
        sales.forEach((s: any) => {
          if (s.sale_date) {
            const d = new Date(s.sale_date)
            const key = d.toLocaleString('en-US', { month: 'short' })
            if (!monthMap[key]) monthMap[key] = { revenue: 0, expenses: 0 }
            monthMap[key].revenue += Number(s.total || 0)
            monthMap[key].expenses += Math.round(Number(s.total || 0) * 0.45)
          }
        })

        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        setRevenueData(months.map((m) => ({
          month: m,
          revenue: Math.round((monthMap[m]?.revenue || 0) / 1000),
          expenses: Math.round((monthMap[m]?.expenses || 0) / 1000),
          profit: Math.round(((monthMap[m]?.revenue || 0) - (monthMap[m]?.expenses || 0)) / 1000),
        })))
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const totalCustomers = kpis.totalCustomers ?? 0
  const totalRevenue = kpis.totalRevenue ?? 0
  const totalSales = kpis.totalSales ?? 0
  const newCustomers = Math.round(totalCustomers * 0.88)
  const avgOrderValue = totalSales ? totalRevenue / totalSales : 674.54

  const periodLabels: Record<string, string> = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  }

  const marketSurvey = [
    { category: 'Product A', satisfaction: 92, revenue: 45 },
    { category: 'Product B', satisfaction: 78, revenue: 32 },
    { category: 'Product C', satisfaction: 65, revenue: 28 },
    { category: 'Product D', satisfaction: 88, revenue: 52 },
    { category: 'Product E', satisfaction: 71, revenue: 19 },
  ]

  const placeValuesByRegion: Record<'all' | 'us' | 'eu' | 'asia', typeof LOCATION_DATA> = {
    all: LOCATION_DATA,
    us: [
      { location: 'North', revenue: 7600, orders: 340, customers: 250 },
      { location: 'South', revenue: 5400, orders: 240, customers: 190 },
      { location: 'East', revenue: 4500, orders: 190, customers: 150 },
    ],
    eu: [
      { location: 'West', revenue: 3800, orders: 180, customers: 140 },
      { location: 'Capital', revenue: 2900, orders: 140, customers: 110 },
    ],
    asia: [
      { location: 'North', revenue: 7200, orders: 320, customers: 260 },
      { location: 'East', revenue: 5100, orders: 240, customers: 180 },
      { location: 'West', revenue: 3900, orders: 170, customers: 130 },
    ],
  }

  const locationChartData = placeValuesByRegion[location]

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.headerTop}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Dashboard Overview</h1>
            <span className={styles.growthBadge}>+14.2%</span>
          </div>
          <p className={styles.subtitle}>All Modules · {periodLabels[period]}</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={16} />
            <input
              className={styles.searchInput}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search data..."
            />
          </div>
          <button className={styles.actionBtn} type="button" onClick={loadDashboard} disabled={isRefreshing}>
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button className={styles.actionBtnPrimary} type="button">
            <Download size={16} />
            Export
          </button>
          <button className={styles.notificationBtn} type="button">
            <Bell size={16} />
            <span className={styles.notificationBadge}>3</span>
          </button>
        </div>
      </div>

      <div className={styles.filterToolbar}>
        <div className={styles.filterTabs}>
          {[
            { label: 'All Time', value: 'all' },
            { label: 'Today', value: 'today' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
            { label: 'Year', value: 'year' },
          ].map((tab) => (
            <button
              key={tab.value}
              className={`${styles.filterTab} ${period === tab.value ? styles.active : ''}`}
              onClick={() => setPeriod(tab.value as any)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.filterActions}>
          <div className={styles.locationLabel}>
            <MapPin size={14} />
            <span>PLACE</span>
          </div>
          <select
            className={styles.filterSelect}
            value={location}
            onChange={(event) => setLocation(event.target.value as any)}
          >
            <option value="all">All Locations</option>
            <option value="us">United States</option>
            <option value="eu">Europe</option>
            <option value="asia">Asia</option>
          </select>
          <div className={styles.chartGroup}
          >
            <span className={styles.chartLabel}>CHART</span>
            <div className={styles.chartToggleGroup}>
              {['Area', 'Bar', 'Line', 'Pie'].map((label) => (
                <button
                  key={label}
                  className={`${styles.chartToggleBtn} ${selectedChart === label ? styles.active : ''}`}
                  type="button"
                  onClick={() => setSelectedChart(label as any)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Overview Chart: Value over Time (between filter and KPIs) ── */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Dashboard Overview — {selectedChart} Chart</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>Showing {periodLabels[period].toLowerCase()} data</p>
          </div>
          <div className={styles.cardActions}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#16a34a', marginRight: 4 }} />Revenue</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', marginRight: 4 }} />Profit</span>
            </div>
            <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          {selectedChart === 'Area' && (
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="ot1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ot2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}K`} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#ot1)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#22c55e" fill="url(#ot2)" strokeWidth={2} strokeDasharray="5 3" name="Profit" />
            </AreaChart>
          )}
          {selectedChart === 'Bar' && (
            <BarChart data={revenueData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}K`} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} name="Profit" />
            </BarChart>
          )}
          {selectedChart === 'Line' && (
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}K`} />
              <Legend iconType="circle" iconSize={8} />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Profit" />
            </LineChart>
          )}
          {selectedChart === 'Pie' && (
            <PieChart>
              <Pie data={revenueData} dataKey="revenue" nameKey="month" cx="50%" cy="50%" outerRadius={80} label>
                {revenueData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={SURVEY_COLORS[index % SURVEY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}K`} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ── Statistics Summary (2 rows × 4) ── */}
      <div className={styles.kpiRow}>
        {[
          {
            label: 'Total Customers',
            value: totalCustomers.toLocaleString(),
            change: '+8.2%',
            status: 'up',
            icon: <Users size={16} strokeWidth={2} />,
            bg: '#dcfce7',
            color: '#16a34a',
          },
          {
            label: 'New Customers',
            value: newCustomers.toLocaleString(),
            change: '+3.1%',
            status: 'up',
            icon: <Users size={16} strokeWidth={2} />,
            bg: '#dbeafe',
            color: '#2563eb',
          },
          {
            label: 'Avg. Order Value',
            value: `$${avgOrderValue.toFixed(2)}`,
            change: '-2.3%',
            status: 'down',
            icon: <DollarSign size={16} strokeWidth={2} />,
            bg: '#f3e8ff',
            color: '#9333ea',
          },
          {
            label: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            change: `+${(kpis.profitMargin || 15.2).toFixed(1)}%`,
            status: 'up',
            icon: <BarChart3 size={16} strokeWidth={2} />,
            bg: '#dcfce7',
            color: '#16a34a',
          },
          {
            label: 'Orders',
            value: totalSales.toLocaleString(),
            change: '+5.7%',
            status: 'up',
            icon: <ShoppingCart size={16} strokeWidth={2} />,
            bg: '#ffedd5',
            color: '#f97316',
          },
          {
            label: 'Monthly Recurring',
            value: `$${Math.round(totalRevenue / 1000)}K`,
            change: '+18.9%',
            status: 'up',
            icon: <Activity size={16} strokeWidth={2} />,
            bg: '#d1fae5',
            color: '#059669',
          },
          {
            label: 'Total Transactions',
            value: (recentTransactions.length || totalSales).toLocaleString(),
            change: '+6.4%',
            status: 'up',
            icon: <CheckCircle2 size={16} strokeWidth={2} />,
            bg: '#ede9fe',
            color: '#7c3aed',
          },
          {
            label: 'Churn Rate',
            value: '12.0%',
            change: '-2.1%',
            status: 'up',
            icon: <TrendingUp size={16} strokeWidth={2} />,
            bg: '#fee2e2',
            color: '#dc2626',
          },
        ].map((card) => (
          <div key={card.label} className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{card.label}</span>
            <span className={styles.kpiValue}>{card.value}</span>
            <span className={`${styles.kpiChange} ${card.status}`}>
              {card.status === 'down' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
              {card.change}
            </span>
            <div className={styles.kpiIconWrap} style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Value Across Locations ── */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Value Across Locations</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>Revenue, orders and customers by region</p>
          </div>
          <div className={styles.cardActions}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#16a34a', marginRight: 4 }} />Revenue</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#22c55e', marginRight: 4 }} />Orders</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#86efac', marginRight: 4 }} />Customers</span>
            </div>
            <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={locationChartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="location" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <Tooltip {...ttip} />
            <Legend iconType="square" iconSize={8} />
            <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={28} name="Revenue" />
            <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} name="Orders" />
            <Bar dataKey="customers" fill="#86efac" radius={[4, 4, 0, 0]} maxBarSize={28} name="Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Main Content: Chart (Left) + Side Panels (Right) ── */}
      <div className={styles.mainContent}>
        {/* Left: Revenue over time chart */}
        <div className={styles.mainChart}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Revenue vs Expenses over Time</h3>
              <div className={styles.cardActions}>
                <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => `$${v.toLocaleString()}K`}
                  contentStyle={{
                    borderRadius: 8, border: '1px solid #e8eaf0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 13,
                  }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#rev)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#exp)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Regional Distribution + Market Survey */}
        <div className={styles.sidePanels}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Regional Distribution</h3>
              <div className={styles.cardActions}>
                <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={salesByRegion.length > 0 ? salesByRegion : [{ name: 'North', value: 35 }, { name: 'South', value: 28 }, { name: 'East', value: 22 }, { name: 'West', value: 15 }]}
                  cx="50%" cy="50%"
                  innerRadius={40} outerRadius={70}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {(salesByRegion.length > 0 ? salesByRegion : [{ name: 'North', value: 35 }, { name: 'South', value: 28 }, { name: 'East', value: 22 }, { name: 'West', value: 15 }]).map((_, i) => (
                    <Cell key={i} fill={SURVEY_COLORS[i % SURVEY_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => `$${(v || 0).toLocaleString()}`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e8eaf0', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.regionLegend}>
              {(salesByRegion.length > 0 ? salesByRegion : [{ name: 'North', value: 35 }, { name: 'South', value: 28 }, { name: 'East', value: 22 }, { name: 'West', value: 15 }]).map((r: any, i: number) => (
                <div key={r.name} className={styles.regionItem}>
                  <span className={styles.regionDot} style={{ background: SURVEY_COLORS[i % SURVEY_COLORS.length] }} />
                  <span className={styles.regionName}>{r.name}</span>
                  <span className={styles.regionValue}>${(r.value || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Market Survey</h3>
              <div className={styles.cardActions}>
                <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
              </div>
            </div>
            <div className={styles.surveyList}>
              {marketSurvey.map((item) => (
                <div key={item.category} className={styles.surveyItem}>
                  <div className={styles.surveyHeader}>
                    <TrendingUp size={13} strokeWidth={2} color="#16a34a" />
                    <span className={styles.surveyCategory}>{item.category}</span>
                    <span className={styles.surveyRevenue}>${item.revenue}K</span>
                  </div>
                  <div className={styles.surveyBarTrack}>
                    <div
                      className={styles.surveyBarFill}
                      style={{ width: `${item.satisfaction}%` }}
                    />
                  </div>
                  <span className={styles.surveyPercent}>{item.satisfaction}% satisfaction</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Recent Transactions ── */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <h3>Recent Transactions</h3>
          <div className={styles.cardActions}>
            <button className={styles.viewAll}>View All</button>
          </div>
        </div>
        <div className={styles.transactionTable}>
          <div className={styles.tableHeader}>
            <span>Invoice</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Time</span>
          </div>
          {recentTransactions.length === 0 && (
            <div className={styles.tableRow} style={{ justifyContent: 'center', color: '#94a3b8' }}>
              <span>No recent transactions</span>
            </div>
          )}
          {recentTransactions.map((tx, i) => (
            <div key={i} className={styles.tableRow}>
              <span className={styles.invoiceId}>{tx.id}</span>
              <span className={styles.customerName}>{tx.customer}</span>
              <span className={styles.amount}>${(tx.amount || 0).toLocaleString()}</span>
              <span className={`${styles.status} ${styles[tx.status?.toLowerCase() || 'completed']}`}>
                {tx.status === 'Completed' && <CheckCircle2 size={12} />}
                {tx.status === 'Pending' && <Clock size={12} />}
                {tx.status === 'Processing' && <Activity size={12} />}
                {tx.status || 'Completed'}
              </span>
              <span className={styles.date}>{tx.date}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}