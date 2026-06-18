import { useState, useEffect } from 'react'
import { Users, UserPlus, RefreshCw as RefreshCwIcon, UserMinus, Search, Download, RefreshCw, MoreHorizontal, ArrowUpRight, MapPin } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '@/services/api'
import styles from './AnalyticsPage.module.css'

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }

export default function CustomersPage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')
  const [growth, setGrowth] = useState<any[]>([])
  const [byRegion, setByRegion] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [customersRes, summaryRes] = await Promise.all([
          api.get('/customers').then(r => r.data).catch(() => []),
          api.get('/customers/summary').then(r => r.data).catch(() => null),
        ])
        if (!mounted) return

        // Build monthly growth data from customers
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        const monthMap: Record<string, { total: number; returning: number }> = {}
        const now = new Date()
        const currentYear = now.getFullYear()
        
        ;(customersRes || []).forEach((c: any) => {
          if (c.created_at) {
            const d = new Date(c.created_at)
            if (d.getFullYear() === currentYear) {
              const m = d.toLocaleString('en-US', { month: 'short' })
              if (!monthMap[m]) monthMap[m] = { total: 0, returning: 0 }
              monthMap[m].total += 1
              // Estimate returning customers as ~65% of total for current data
              monthMap[m].returning += 1
            }
          }
        })
        
        // Calculate cumulative totals
        let cumulative = 0
        let returningCumulative = 0
        const growthData = monthNames.map(m => {
          cumulative += monthMap[m]?.total || 0
          returningCumulative += Math.round((monthMap[m]?.total || 0) * 0.65)
          return {
            month: m,
            total: cumulative,
            returning: returningCumulative,
          }
        })
        setGrowth(growthData)

        // Regional data from summary
        if (summaryRes?.bySegment) {
          setByRegion(summaryRes.bySegment.map((s: any) => ({
            region: s.name,
            value: s.value,
          })))
        }

        // KPIs
        const totalCustomers = customersRes?.length || 0
        const newThisMonth = summaryRes?.newThisMonth || 0
        setKpis([
          { label: 'Total Customers', value: totalCustomers.toLocaleString(), change: '', up: true, icon: <Users size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'New Customers', value: newThisMonth.toLocaleString(), change: '', up: true, icon: <UserPlus size={16} />, iconBg: '#dbeafe', iconColor: '#2563eb' },
          { label: 'Avg. Order Value', value: '$0', change: '', up: false, icon: <UserMinus size={16} />, iconBg: '#f3e8ff', iconColor: '#9333ea' },
          { label: 'Total Revenue', value: '$0', change: '', up: true, icon: <Users size={16} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Orders', value: '0', change: '', up: true, icon: <Users size={16} />, iconBg: '#ffedd5', iconColor: '#f97316' },
          { label: 'Monthly Recurring', value: '$0', change: '', up: true, icon: <RefreshCwIcon size={16} />, iconBg: '#d1fae5', iconColor: '#059669' },
          { label: 'Total Transactions', value: totalCustomers.toLocaleString(), change: '', up: true, icon: <Users size={16} />, iconBg: '#ede9fe', iconColor: '#7c3aed' },
          { label: 'Churn Rate', value: '0%', change: '', up: true, icon: <UserMinus size={16} />, iconBg: '#fee2e2', iconColor: '#dc2626' },
        ])
      } catch (e) {
        console.error('Failed to load customers data', e)
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
        {kpis.length === 0 && !loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No customer data available yet. Add customers to see analytics.</div>
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
              <h3>Analysis: Customers — Area Chart</h3>
              <p className={styles.cardSub}>Showing {period.toLowerCase()} data</p>
            </div>
            <div className={styles.cardLegend}>
              <span className={styles.legendDot} style={{ background: '#16a34a' }} /> Total
              <span className={styles.legendDot} style={{ background: '#22c55e' }} /> Returning
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growth.length > 0 ? growth : []}>
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
            <BarChart data={byRegion.length > 0 ? byRegion : []} layout="vertical">
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
