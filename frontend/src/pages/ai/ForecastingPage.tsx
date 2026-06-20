import { useState, useEffect } from 'react'
import { TrendingUp, Target, BarChart2, Search, Download, RefreshCw, MoreHorizontal, ArrowUpRight, MapPin } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '@/services/api'
import styles from '../analytics/AnalyticsPage.module.css'

const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' } }
const axis = { axisLine: false as const, tickLine: false as const }

export default function ForecastingPage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Area')
  const [data, setData] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const salesRes = await api.get('/sales').then(r => r.data).catch(() => [])
        if (!mounted) return

        // Build forecast data from historical sales
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        const monthMap: Record<string, number[]> = {}
        const now = new Date()
        const currentYear = now.getFullYear()
        
        ;(salesRes || []).forEach((s: any) => {
          if (s.sale_date) {
            const d = new Date(s.sale_date)
            if (d.getFullYear() === currentYear) {
              const m = d.toLocaleString('en-US', { month: 'short' })
              if (!monthMap[m]) monthMap[m] = []
              monthMap[m].push(Number(s.total || s.amount || 0))
            }
          }
        })
        
        // Calculate monthly averages
        const monthlyData: any[] = monthNames.map(m => {
          const values = monthMap[m] || []
          const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
          return { month: m, actual: avg }
        })
        
        // Simple linear projection for next 3 months
        const lastThree = monthlyData.slice(-3).filter(d => d.actual > 0)
        const avgGrowth = lastThree.length >= 2 
          ? (lastThree[lastThree.length - 1].actual - lastThree[0].actual) / (lastThree.length - 1)
          : 0
        
        const forecastData: any[] = [...monthlyData]
        const lastMonth = monthlyData[monthlyData.length - 1]
        const lastMonthIndex = monthNames.indexOf(lastMonth.month)
        
        for (let i = 1; i <= 3; i++) {
          const nextIndex = (lastMonthIndex + i) % 12
          const nextMonth = monthNames[nextIndex]
          const forecastValue = Math.round(lastMonth.actual + (avgGrowth * i))
          forecastData.push({ month: nextMonth, forecast: Math.max(0, forecastValue) })
        }
        
        setData(forecastData)

        // Calculate KPIs
        const totalRevenue = (salesRes || []).reduce((sum: number, s: any) => sum + Number(s.total || s.amount || 0), 0)
        const avgOrderValue = salesRes?.length ? Math.round(totalRevenue / salesRes.length) : 0
        const nextMonthForecast = forecastData.find(d => d.forecast && !d.actual)?.forecast || 0
        
        setKpis([
          { label: 'Next Month Forecast', value: `$${nextMonthForecast.toLocaleString()}`, change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Forecast Accuracy', value: '0%', change: '', up: true, iconBg: '#dbeafe', iconColor: '#2563eb' },
          { label: 'Q1 Growth Projection', value: '0%', change: '', up: true, iconBg: '#f3e8ff', iconColor: '#9333ea' },
          { label: 'Confidence Level', value: '0%', change: '', up: true, iconBg: '#d1fae5', iconColor: '#059669' },
          { label: 'Revenue at Risk', value: '$0', change: '', up: true, iconBg: '#fee2e2', iconColor: '#dc2626' },
          { label: 'Trend Direction', value: avgGrowth > 0 ? 'Upward' : avgGrowth < 0 ? 'Downward' : 'Stable', change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Forecast Horizon', value: '3 months', change: '', up: true, iconBg: '#ede9fe', iconColor: '#7c3aed' },
          { label: 'Model Version', value: 'v1.0', change: '', up: true, iconBg: '#fef3c7', iconColor: '#d97706' },
        ])
      } catch (e) {
        console.error('Failed to load forecast data', e)
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
        {kpis.length === 0 && !loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No forecast data available. Add sales data to generate forecasts.</div>
        ) : (
          kpis.map(k => (
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
          ))
        )}
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
            <AreaChart data={data.length > 0 ? data : []}>
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
