import { useState, useEffect } from 'react'
import { Package, AlertTriangle, RefreshCw, XCircle, Search, Download, MoreHorizontal, ArrowUpRight, MapPin } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/services/api'
import styles from './AnalyticsPage.module.css'

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' } }

export default function InventoryPage() {
  const [period, setPeriod] = useState('All Time')
  const [chartType, setChartType] = useState('Bar')
  const [stock, setStock] = useState<any[]>([])
  const [trend, setTrend] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lowStockItems, setLowStockItems] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [inventoryRes, productsRes] = await Promise.all([
          api.get('/inventory').then(r => r.data).catch(() => ({ items: [] })),
          api.get('/products').then(r => r.data).catch(() => []),
        ])
        if (!mounted) return

        // Stock data from inventory
        const items = inventoryRes?.items || inventoryRes || []
        const stockData = (items || []).map((item: any) => ({
          product: item.productName || item.product_name || 'Unknown',
          stock: item.stock || item.stock_quantity || 0,
          reorder: item.reorderLevel || item.reorder_level || 0,
        }))
        setStock(stockData)

        // Build trend data from inventory history (simplified - using current stock levels by month)
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        const now = new Date()
        const currentYear = now.getFullYear()
        
        // For trend, we'll show current stock status
        const totalStock = (items || []).reduce((sum: number, item: any) => sum + (item.stock || item.stock_quantity || 0), 0)
        const lowStockCount = (items || []).filter((item: any) => {
          const stock = item.stock || item.stock_quantity || 0
          const reorder = item.reorderLevel || item.reorder_level || 0
          return stock <= reorder
        }).length
        
        const trendData = monthNames.map(m => ({
          month: m,
          inStock: Math.round(totalStock / 12),
          lowStock: Math.round(lowStockCount / 12),
        }))
        setTrend(trendData)

        const lowStock = stockData.filter((s: any) => s.stock < s.reorder)
        setLowStockItems(lowStock)
        
        // KPIs
        const totalProducts = (productsRes || []).length
        const totalStockValue = (items || []).reduce((sum: number, item: any) => {
          const stock = item.stock || item.stock_quantity || 0
          const price = item.price || 0
          return sum + (stock * price)
        }, 0)
        const outOfStockCount = (items || []).filter((item: any) => (item.stock || item.stock_quantity || 0) === 0).length
        
        setKpis([
          { label: 'Total Products', value: totalProducts.toLocaleString(), change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Low Stock Items', value: String(lowStock.length), change: '', up: false, iconBg: '#fef3c7', iconColor: '#d97706' },
          { label: 'Avg. Order Value', value: '$0', change: '', up: false, iconBg: '#f3e8ff', iconColor: '#9333ea' },
          { label: 'Total Stock Value', value: `$${(totalStockValue / 1000).toFixed(0)}K`, change: '', up: true, iconBg: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Turnover Rate', value: '0x', change: '', up: true, iconBg: '#d1fae5', iconColor: '#059669' },
          { label: 'Monthly Inflow', value: '$0', change: '', up: true, iconBg: '#dbeafe', iconColor: '#2563eb' },
          { label: 'Out of Stock', value: String(outOfStockCount), change: '', up: false, iconBg: '#fee2e2', iconColor: '#dc2626' },
          { label: 'Reorder Pending', value: String(lowStock.length), change: '', up: true, iconBg: '#ede9fe', iconColor: '#7c3aed' },
        ])
      } catch (e) {
        console.error('Failed to load inventory data', e)
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
            <h1 className={styles.title}>Analysis: Inventory</h1>
            {lowStockItems.length > 0 && <span className={styles.warningBadge}>{lowStockItems.length} Low Stock</span>}
          </div>
          <p className={styles.subtitle}>Inventory Module · Jan 2025 – Dec 2025</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input placeholder="Search data..." className={styles.searchInput} />
          </div>
          <button className={styles.actionBtn}><RefreshCw size={15} /> Refresh</button>
          <button className={styles.actionBtnPrimary}><Download size={15} /> Export</button>
        </div>
      </div>

      <div className={styles.filterToolbar}>
        <div className={styles.filterTabs}>
          {['All Time', 'Today', 'Week', 'Month', 'Year'].map(p => (
            <button key={p} className={`${styles.filterTab} ${period === p ? styles.active : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
        <div className={styles.filterActions}>
          <div className={styles.locationLabel}><MapPin size={12} /> PLACE</div>
          <select className={styles.filterSelect}><option>All Locations</option></select>
          <div className={styles.chartGroup}>
            <span className={styles.chartLabel}>CHART</span>
            {['Area', 'Bar', 'Line', 'Pie'].map(c => (
              <button key={c} className={`${styles.chartToggleBtn} ${chartType === c ? styles.chartActive : ''}`} onClick={() => setChartType(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.kpiRow}>
        {kpis.length === 0 && !loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No inventory data available yet. Add products and inventory to see analytics.</div>
        ) : (
          kpis.map(k => (
            <div key={k.label} className={styles.kpiCard}>
              <div className={styles.kpiIconWrap} style={{ background: k.iconBg, color: k.iconColor }}>
                <Package size={16} />
              </div>
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
              <h3>Analysis: Inventory — Stock Trend</h3>
              <p className={styles.cardSub}>Showing {period.toLowerCase()} data</p>
            </div>
            <div className={styles.cardLegend}>
              <span className={styles.legendDot} style={{ background: '#16a34a' }} /> In Stock
              <span className={styles.legendDot} style={{ background: '#f59e0b' }} /> Low Stock
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend.length > 0 ? trend : []}>
              <defs>
                <linearGradient id="inv1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="inv2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <Tooltip {...ttip} />
              <Area type="monotone" dataKey="inStock" stroke="#16a34a" fill="url(#inv1)" strokeWidth={2} name="In Stock" />
              <Area type="monotone" dataKey="lowStock" stroke="#f59e0b" fill="url(#inv2)" strokeWidth={2} name="Low Stock" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Stock by Product</h3>
            <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stock.length > 0 ? stock : []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
              <YAxis dataKey="product" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={60} {...axis} />
              <Tooltip {...ttip} />
              <Bar dataKey="stock" fill="#16a34a" radius={[0, 4, 4, 0]} maxBarSize={16} name="Stock" />
              <Bar dataKey="reorder" fill="#a3d4a3" radius={[0, 4, 4, 0]} maxBarSize={16} name="Reorder" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
