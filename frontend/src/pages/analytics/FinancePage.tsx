import { useState, useEffect } from 'react'
import { DollarSign, ArrowUpRight, TrendingUp, PieChart as PieIcon, Search, Download, RefreshCw, MoreHorizontal, MapPin } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '@/services/api'
import styles from './AnalyticsPage.module.css'

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }

export default function FinancePage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')
  const [cashFlow, setCashFlow] = useState<any[]>([])
  const [byRegion, setByRegion] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [salesRes, expensesRes] = await Promise.all([
          api.get('/sales').then(r => r.data).catch(() => []),
          api.get('/finance/expenses').then(r => r.data).catch(() => []),
        ])
        if (!mounted) return

        // Build monthly cash flow data
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        const monthMap: Record<string, { inflow: number; outflow: number }> = {}
        const now = new Date()
        const currentYear = now.getFullYear()
        
        ;(salesRes || []).forEach((s: any) => {
          if (s.sale_date) {
            const d = new Date(s.sale_date)
            if (d.getFullYear() === currentYear) {
              const m = d.toLocaleString('en-US', { month: 'short' })
              if (!monthMap[m]) monthMap[m] = { inflow: 0, outflow: 0 }
              monthMap[m].inflow += Number(s.total || s.amount || 0)
            }
          }
        })
        
        ;(expensesRes || []).forEach((e: any) => {
          if (e.date || e.created_at) {
            const d = new Date(e.date || e.created_at)
            if (d.getFullYear() === currentYear) {
              const m = d.toLocaleString('en-US', { month: 'short' })
              if (!monthMap[m]) monthMap[m] = { inflow: 0, outflow: 0 }
              monthMap[m].outflow += Number(e.amount || 0)
            }
          }
        })
        
        const cashFlowData = monthNames.map(m => ({
          month: m,
          inflow: Math.round((monthMap[m]?.inflow || 0) / 1000),
          outflow: Math.round((monthMap[m]?.outflow || 0) / 1000),
        }))
        setCashFlow(cashFlowData)

        // Regional data from sales
        const regionMap: Record<string, number> = {}
        ;(salesRes || []).forEach((s: any) => {
          if (s.region) {
            regionMap[s.region] = (regionMap[s.region] || 0) + Number(s.total || s.amount || 0)
          }
        })
        const regionData = Object.entries(regionMap).map(([region, value]) => ({
          region,
          value: Math.round(value / 1000),
        }))
        setByRegion(regionData.length > 0 ? regionData : [])

        // KPIs
        const totalRevenue = (salesRes || []).reduce((sum: number, s: any) => sum + Number(s.total || s.amount || 0), 0)
        const totalExpenses = (expensesRes || []).reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0)
        const netProfit = totalRevenue - totalExpenses
        const totalSales = (salesRes || []).length
        
        setKpis([
          { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(0)}K`, change: '', up: true, icon: <DollarSign size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Gross Profit', value: `$${(totalRevenue * 0.6 / 1000).toFixed(0)}K`, change: '', up: true, icon: <TrendingUp size={16} />, iconBg: '#dbeafe', iconColor: '#2563eb' },
          { label: 'Avg. Order Value', value: totalSales ? `$${Math.round(totalRevenue / totalSales).toLocaleString()}` : '$0', change: '', up: false, icon: <DollarSign size={16} />, iconBg: '#f3e8ff', iconColor: '#9333ea' },
          { label: 'Net Profit', value: `$${(netProfit / 1000).toFixed(0)}K`, change: '', up: true, icon: <TrendingUp size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Total Expenses', value: `$${(totalExpenses / 1000).toFixed(0)}K`, change: '', up: false, icon: <ArrowUpRight size={16} />, iconBg: '#ffedd5', iconColor: '#f97316' },
          { label: 'Monthly Recurring', value: '$0', change: '', up: true, icon: <DollarSign size={16} />, iconBg: '#d1fae5', iconColor: '#059669' },
          { label: 'Total Transactions', value: totalSales.toLocaleString(), change: '', up: true, icon: <PieIcon size={16} />, iconBg: '#ede9fe', iconColor: '#7c3aed' },
          { label: 'Budget Used', value: totalRevenue > 0 ? `${Math.round((totalExpenses / totalRevenue) * 100)}%` : '0%', change: '', up: false, icon: <PieIcon size={16} />, iconBg: '#fee2e2', iconColor: '#dc2626' },
        ])
      } catch (e) {
        console.error('Failed to load finance data', e)
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
        {kpis.length === 0 && !loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No finance data available yet. Add sales and expenses to see analytics.</div>
        ) : (
          kpis.map(k => (
            <div key={k.label} className={styles.kpiCard}>
              <div className={styles.kpiIconWrap} style={{ background: k.iconBg, color: k.iconColor }}>{k.icon}</div>
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
              <h3>Analysis: Finance — Cash Flow</h3>
              <p className={styles.cardSub}>Showing {period.toLowerCase()} data</p>
            </div>
            <div className={styles.cardLegend}>
              <span className={styles.legendDot} style={{ background: '#16a34a' }} /> Inflow
              <span className={styles.legendDot} style={{ background: '#f43f5e' }} /> Outflow
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cashFlow.length > 0 ? cashFlow : []}>
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
            <BarChart data={byRegion.length > 0 ? byRegion : []} layout="vertical">
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
