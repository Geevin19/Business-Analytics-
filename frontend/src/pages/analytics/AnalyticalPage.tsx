import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BarChart3, TrendingUp, TrendingDown, Activity,
  AreaChart as AreaChartIcon, BarChart, LineChart, PieChart,
  Calendar, MapPin, Download, Table2, RefreshCw,
  ArrowUpRight, ArrowDownLeft, Hash, LineChart as LineChartIcon,
  Sigma, Minus, Plus, Target, Zap, TrendingUp as TrendUpIcon,
  Search, Bell, MoreHorizontal, CheckCircle2, Clock,
  Info
} from 'lucide-react'
import {
  AreaChart, Area, BarChart as ReBarChart, Bar, LineChart as ReLineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart as RePieChart, Pie, Cell
} from 'recharts'
import PageShell from '@/components/ui/PageShell'
import api from '@/services/api'
import styles from './AnalyticalPage.module.css'

/* ── Types ── */
interface AnalyzedColumn {
  id: string
  datasetId: string
  datasetName: string
  columnName: string
  trend: string
  trendPercentage: number
  mean: number
  min: number
  max: number
}

interface TrendDetail {
  rawData: number[]
  labels: string[]
  mean: number
  median: number
  mode: number[]
  stdDev: number
  variance: number
  min: number
  max: number
  range: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  movingAverage: number[]
  forecast: number[]
  linearRegression: { slope: number; intercept: number; r2: number }
  seasonalIndex: number[]
  growthRate: number[]
  compoundGrowthRate: number
}

interface FullDataset {
  id: string
  fileName: string
  fileType: string
  uploadedAt: string
  rowCount: number
  columnNames: string[]
  numericColumns: string[]
  analysis: Record<string, TrendDetail>
  rawPreview: Record<string, any>[]
  schedule?: string
  locationColumns?: string[]
  locationAnalysis?: Record<string, Record<string, TrendDetail>>
}

type ChartType = 'area' | 'bar' | 'line' | 'pie'
type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all'

/* ── Helpers ── */
function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)
}

function getDateRange(filter: TimeFilter): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  const start = new Date(now)

  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      start.setDate(start.getDate() - start.getDay())
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      break
    default: // 'all'
      start.setFullYear(2000, 0, 1)
  }

  return { start, end }
}

/* ── Statistical Formula Labels ── */
const FORMULAS: Record<string, { formula: string; label: string }> = {
  mean: { label: 'Mean (μ)', formula: 'μ = (1/n) × Σxᵢ  — average of all values' },
  median: { label: 'Median', formula: 'Middle value when data is sorted (50th percentile)' },
  stdDev: { label: 'Std Dev (σ)', formula: 'σ = √( (1/n) × Σ(xᵢ - μ)² )  — measures data spread' },
  variance: { label: 'Variance (σ²)', formula: 'σ² = (1/n) × Σ(xᵢ - μ)²  — squared deviation from mean' },
  min: { label: 'Minimum', formula: 'Min = smallest value in dataset' },
  max: { label: 'Maximum', formula: 'Max = largest value in dataset' },
  range: { label: 'Range', formula: 'Range = Max - Min  — total spread of data' },
  trend: { label: 'Trend', formula: 'Trend% = ((last - first) / |first|) × 100  — direction & magnitude' },
  r2: { label: 'R² (Coefficient of Determination)', formula: 'R² = 1 - (SS_res / SS_tot)  — how well regression fits (0-1)' },
  cgr: { label: 'Compound Growth Rate (CGR)', formula: 'CGR = ((V_final / V_initial)^(1/(n-1)) - 1) × 100  — annualized growth' },
  slope: { label: 'Regression Slope (m)', formula: 'm = (n×Σxy - Σx×Σy) / (n×Σx² - (Σx)²)  — rate of change per unit' },
  movingAvg: { label: 'Moving Average (MA)', formula: 'MA_k = (1/w) × Σ(x_i ... x_{i+w-1})  — smooths fluctuations (window=3)' },
  forecast: { label: 'Forecast (Linear Extrapolation)', formula: 'F(t) = m×t + b  — projects future values along regression line' },
  seasonalIndex: { label: 'Seasonal Index', formula: 'S_i = (avg of period i / overall mean) × 100  — detects seasonal patterns' },
}

/* ── Palette for Pie ── */
const COLORS = ['#16a34a', '#2563eb', '#f97316', '#8b5cf6', '#dc2626', '#14b8a6', '#f59e0b', '#ec4899']
const SURVEY_COLORS = ['#16a34a', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6']

/* ── Component ── */
export default function AnalyticalPage() {
  const { columnId } = useParams<{ columnId: string }>()
  const navigate = useNavigate()

  const [allColumns, setAllColumns] = useState<AnalyzedColumn[]>([])
  const [fullDataset, setFullDataset] = useState<FullDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<ChartType>('area')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [placeFilter, setPlaceFilter] = useState<string>('all')
  const [showFormula, setShowFormula] = useState<string | null>(null)

  // Find the active column info
  const activeColumn = useMemo(
    () => allColumns.find(c => c.id === columnId),
    [allColumns, columnId]
  )

  // Load all analyzed columns + full dataset
  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      const colsRes = await api.get('/trend/analyzed-columns')
      setAllColumns(colsRes.data)

      if (columnId) {
        const col = colsRes.data.find((c: AnalyzedColumn) => c.id === columnId)
        if (col) {
          const dsRes = await api.get(`/trend/datasets/${col.datasetId}`)
          setFullDataset(dsRes.data)
        }
      }
    } catch (err) {
      console.error('Failed to load analytical data', err)
    } finally {
      setLoading(false)
    }
  }, [columnId])

  useEffect(() => { loadData() }, [loadData])

  // Extract unique "places" from rawPreview
  const placeOptions = useMemo(() => {
    if (!fullDataset) return ['all']
    const locationCols = fullDataset.locationColumns
    if (locationCols && locationCols.length > 0) {
      const locCol = locationCols[0]
      const unique = [...new Set(fullDataset.rawPreview.map(r => String(r[locCol] ?? '')).filter(Boolean))]
      return unique.length > 0 ? ['all', ...unique] : ['all']
    }
    return ['all']
  }, [fullDataset])

  // Build location breakdown data from rawPreview
  const locationBreakdownData = useMemo(() => {
    if (!fullDataset || !activeColumn) return []
    const locationCols = fullDataset.locationColumns
    if (!locationCols || locationCols.length === 0) return []

    const locCol = locationCols[0]
    const colName = activeColumn.columnName
    const groups: Record<string, number[]> = {}

    fullDataset.rawPreview.forEach(r => {
      const loc = String(r[locCol] ?? 'Unknown')
      const val = Number(r[colName])
      if (!isNaN(val)) {
        if (!groups[loc]) groups[loc] = []
        groups[loc].push(val)
      }
    })

    return Object.entries(groups)
      .filter(([, vals]) => vals.length > 0)
      .map(([location, vals]) => {
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length
        const total = vals.reduce((s, v) => s + v, 0)
        const cnt = vals.length
        return { location, avg: Math.round(avg * 100) / 100, total, count: cnt }
      })
      .sort((a, b) => b.total - a.total)
  }, [fullDataset, activeColumn])

  // Get the active analysis for the column
  const activeAnalysis = useMemo<TrendDetail | null>(() => {
    if (!fullDataset || !activeColumn) return null

    // If place filter is active and we have location analysis, use it
    if (placeFilter !== 'all' && fullDataset.locationAnalysis && fullDataset.locationAnalysis[placeFilter]) {
      const locAnalysis = fullDataset.locationAnalysis[placeFilter]
      return locAnalysis[activeColumn.columnName] ?? null
    }

    return fullDataset.analysis[activeColumn.columnName] ?? null
  }, [fullDataset, activeColumn, placeFilter])

  // Filter data based on time and place
  const filteredData = useMemo(() => {
    if (!activeAnalysis) return []

    const { rawData, labels } = activeAnalysis
    const combined = rawData.map((v, i) => ({
      label: labels[i] || `#${i + 1}`,
      value: v,
      movingAvg: activeAnalysis.movingAverage?.[i] ?? null,
    }))

    // Apply time filter
    if (timeFilter !== 'all') {
      const limit =
        timeFilter === 'today' ? Math.min(combined.length, 24) :
        timeFilter === 'week' ? Math.min(combined.length, 7) :
        timeFilter === 'month' ? Math.min(combined.length, 30) :
        Math.min(combined.length, 365)
      return combined.slice(-limit)
    }

    return combined
  }, [activeAnalysis, timeFilter])

  // Build forecast data
  const forecastData = useMemo(() => {
    if (!activeAnalysis) return []
    const current = activeAnalysis.rawData.map((v, i) => ({
      label: activeAnalysis.labels[i] || `#${i + 1}`,
      actual: v,
      forecast: null as number | null,
    }))
    const future = activeAnalysis.forecast.map((v, i) => ({
      label: `F${i + 1}`,
      actual: null as number | null,
      forecast: v,
    }))
    return [...current.slice(-30), ...future]
  }, [activeAnalysis])

  // Generate market survey-like data from column stats
  const marketSurveyData = useMemo(() => {
    if (!activeAnalysis || !fullDataset) return []
    return fullDataset.numericColumns
      .filter(col => fullDataset.analysis[col])
      .map(col => {
        const a = fullDataset.analysis[col]
        const r2Score = Math.round((a.linearRegression.r2 || 0) * 100)
        const trendScore = Math.min(100, Math.round(Math.abs(a.trendPercentage) * 2))
        const overallScore = Math.min(100, Math.round((r2Score + trendScore) / 2))
        return {
          category: col,
          satisfaction: Math.max(10, overallScore),
          revenue: Math.round(Math.abs(a.mean) / 1000),
        }
      })
      .sort((a, b) => b.satisfaction - a.satisfaction)
      .slice(0, 5)
  }, [activeAnalysis, fullDataset])

  // Regional distribution from location data
  const regionalDistData = useMemo(() => {
    if (locationBreakdownData.length > 0) {
      return locationBreakdownData.map(d => ({
        name: d.location,
        value: Math.round(d.total),
      }))
    }
    return []
  }, [locationBreakdownData])

  // Recent transactions from raw data
  const recentTransactions = useMemo(() => {
    if (!fullDataset || !activeColumn) return []
    return fullDataset.rawPreview.slice(0, 5).map((r, i) => ({
      id: `#${i + 1}`,
      customer: r[fullDataset.columnNames[0]] || `Entry ${i + 1}`,
      amount: Number(r[activeColumn.columnName]) || 0,
      status: i === 0 ? 'Completed' : i === 1 ? 'Processing' : 'Completed',
      date: fullDataset.uploadedAt
        ? new Date(fullDataset.uploadedAt).toLocaleDateString()
        : '-',
    }))
  }, [fullDataset, activeColumn])

  // Chart tooltip style
  const tooltipStyle = {
    contentStyle: { borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 } as React.CSSProperties,
  }

  // Render the appropriate chart
  const renderChart = () => {
    if (!filteredData.length) return <div className={styles.emptyState}>No data to display</div>

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [formatNumber(v), 'Value']} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#areaGrad)" strokeWidth={2} name="Value" />
              {activeAnalysis && (
                <Area type="monotone" dataKey="movingAvg" stroke="#2563eb" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Moving Avg (3)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <ReBarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [formatNumber(v), 'Value']} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="value" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={28} name="Value" />
            </ReBarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <ReLineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [formatNumber(v), 'Value']} />
              <Legend iconType="circle" iconSize={8} />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} name="Value" />
              {activeAnalysis && (
                <Line type="monotone" dataKey="movingAvg" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Moving Avg (3)" />
              )}
            </ReLineChart>
          </ResponsiveContainer>
        )
      case 'pie':
        const pieData = filteredData.map(d => ({ name: d.label, value: Math.abs(d.value) }))
        return (
          <ResponsiveContainer width="100%" height={220}>
            <RePieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
            </RePieChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  // Render the location chart
  const renderLocationChart = () => {
    if (!locationBreakdownData.length) return null
    return (
      <ResponsiveContainer width="100%" height={220}>
        <ReBarChart data={locationBreakdownData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="location" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Legend iconType="square" iconSize={8} />
          <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={28} name="Total Value" />
          <Bar dataKey="avg" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} name="Average" />
          <Bar dataKey="count" fill="#86efac" radius={[4, 4, 0, 0]} maxBarSize={28} name="Count" />
        </ReBarChart>
      </ResponsiveContainer>
    )
  }

  const periodLabels: Record<string, string> = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  }

  // Handle case where no column is selected
  if (!columnId) {
    return (
      <PageShell title="Analytical View" subtitle="Select an analyzed column from the sidebar to view detailed analytics">
        <div className={styles.emptyState}>
          <BarChart3 size={48} className={styles.emptyIcon} />
          <div className={styles.emptyText}>No column selected</div>
          <div className={styles.emptyHint}>Choose an analyzed column from the Analytical section in the sidebar</div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={activeColumn ? activeColumn.columnName : 'Analytical View'}
      subtitle={activeColumn ? `From dataset: ${activeColumn.datasetName} · ${activeColumn.trendPercentage > 0 ? '+' : ''}${activeColumn.trendPercentage.toFixed(1)}% trend` : 'Detailed analysis of your data columns'}
    >
      {/* ── Heading + Refresh row ── */}
      <div className={styles.headingRow}>
        <div className={styles.headingActions}>
          {fullDataset && (
            <span className={styles.headingMeta}>
              {fullDataset.fileName} · {fullDataset.rowCount} rows
            </span>
          )}
          <button className={styles.headingRefresh} onClick={loadData} disabled={loading} title="Refresh data">
            <RefreshCw size={14} className={loading ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
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
              className={`${styles.filterTab} ${timeFilter === tab.value ? styles.active : ''}`}
              onClick={() => setTimeFilter(tab.value as any)}
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
            value={placeFilter}
            onChange={(event) => setPlaceFilter(event.target.value)}
          >
            {placeOptions.map(p => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Locations' : p}
              </option>
            ))}
          </select>
          <div className={styles.chartGroup}>
            <span className={styles.chartLabel}>CHART</span>
            <div className={styles.chartToggleGroup}>
              {['Area', 'Bar', 'Line', 'Pie'].map((label) => (
                <button
                  key={label}
                  className={`${styles.chartToggleBtn} ${chartType === label.toLowerCase() ? styles.active : ''}`}
                  type="button"
                  onClick={() => setChartType(label.toLowerCase() as any)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          Loading analysis...
        </div>
      ) : activeAnalysis ? (
        <>
          {/* ── Overview Chart ── */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Column Overview — {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                  Showing {periodLabels[timeFilter].toLowerCase()} data
                  {placeFilter !== 'all' && ` for ${placeFilter}`}
                  {activeAnalysis && ` · ${activeAnalysis.rawData.length} data points`}
                </p>
              </div>
              <div className={styles.cardActions}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginRight: 4 }} />Value</span>
                  {activeAnalysis && (
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2563eb', marginRight: 4 }} />MA(3)</span>
                  )}
                </div>
                <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
              </div>
            </div>
            {renderChart()}
          </div>

          {/* ── KPI Cards ── */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Statistics Summary — Metrics & Formulas</h3>
              <div className={styles.cardActions}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                  Click <Info size={12} style={{ verticalAlign: 'middle' }} /> for formula
                </span>
              </div>
            </div>
            <div className={styles.analyticsKpiRow}>
              {[
                { key: 'mean', label: 'Mean (μ)', value: formatNumber(activeAnalysis.mean), change: `${activeAnalysis.rawData.length} pts`, icon: <Hash size={14} />, bg: '#dcfce7', color: '#16a34a' },
                { key: 'median', label: 'Median', value: formatNumber(activeAnalysis.median), change: '50th %ile', icon: <Target size={14} />, bg: '#dbeafe', color: '#2563eb' },
                { key: 'stdDev', label: 'Std Dev (σ)', value: formatNumber(activeAnalysis.stdDev), change: activeAnalysis.stdDev > activeAnalysis.mean * 0.5 ? 'High spread' : 'Low spread', icon: <Sigma size={14} />, bg: '#f3e8ff', color: '#9333ea', down: activeAnalysis.stdDev > activeAnalysis.mean * 0.5 },
                { key: 'variance', label: 'Variance (σ²)', value: formatNumber(activeAnalysis.variance), change: 'σ²', icon: <Activity size={14} />, bg: '#ffedd5', color: '#f97316' },
                { key: 'min', label: 'Min', value: formatNumber(activeAnalysis.min), change: 'Lower bound', icon: <Minus size={14} />, bg: '#fee2e2', color: '#dc2626', down: true },
                { key: 'max', label: 'Max', value: formatNumber(activeAnalysis.max), change: 'Upper bound', icon: <Plus size={14} />, bg: '#d1fae5', color: '#059669' },
                { key: 'range', label: 'Range', value: formatNumber(activeAnalysis.range), change: 'Max–Min', icon: <BarChart3 size={14} />, bg: '#ede9fe', color: '#7c3aed' },
                { key: 'trend', label: 'Trend', value: `${activeAnalysis.trendPercentage > 0 ? '+' : ''}${activeAnalysis.trendPercentage.toFixed(1)}%`, change: activeAnalysis.trend === 'up' ? 'Growing' : activeAnalysis.trend === 'down' ? 'Declining' : 'Stable', icon: activeAnalysis.trend === 'up' ? <TrendUpIcon size={14} /> : activeAnalysis.trend === 'down' ? <TrendingDown size={14} /> : <Activity size={14} />, bg: activeAnalysis.trend === 'up' ? '#dcfce7' : activeAnalysis.trend === 'down' ? '#fee2e2' : '#fffbeb', color: activeAnalysis.trend === 'up' ? '#16a34a' : activeAnalysis.trend === 'down' ? '#dc2626' : '#d97706', trendColor: activeAnalysis.trend },
                { key: 'r2', label: 'R² Fit', value: activeAnalysis.linearRegression.r2.toFixed(4), change: activeAnalysis.linearRegression.r2 >= 0.7 ? 'Good fit' : 'Poor fit', icon: <LineChartIcon size={14} />, bg: activeAnalysis.linearRegression.r2 >= 0.7 ? '#dcfce7' : '#fee2e2', color: activeAnalysis.linearRegression.r2 >= 0.7 ? '#16a34a' : '#dc2626', down: activeAnalysis.linearRegression.r2 < 0.7 },
                { key: 'cgr', label: 'CGR', value: `${activeAnalysis.compoundGrowthRate.toFixed(2)}%`, change: activeAnalysis.compoundGrowthRate >= 0 ? 'Growth' : 'Decline', icon: <TrendUpIcon size={14} />, bg: '#f0fdf4', color: '#16a34a', down: activeAnalysis.compoundGrowthRate < 0 },
                { key: 'slope', label: 'Slope (m)', value: formatNumber(activeAnalysis.linearRegression.slope), change: activeAnalysis.linearRegression.slope >= 0 ? 'Positive' : 'Negative', icon: <Zap size={14} />, bg: '#ffedd5', color: '#f97316', down: activeAnalysis.linearRegression.slope < 0 },
                { key: 'points', label: 'Data Points (n)', value: String(activeAnalysis.rawData.length), change: 'Samples', icon: <Hash size={14} />, bg: '#fce7f3', color: '#db2777', noFormula: true },
              ].map(card => (
                <div key={card.key} className={styles.analyticsKpiCard} onClick={() => !card.noFormula && setShowFormula(showFormula === card.key ? null : card.key)}>
                  <span className={styles.analyticsKpiLabel}>
                    {card.label}
                    {!card.noFormula && <Info size={10} style={{ verticalAlign: 'middle', cursor: 'pointer', opacity: 0.5, marginLeft: 2 }} />}
                  </span>
                  <span className={`${styles.analyticsKpiValue} ${card.trendColor ? styles[`trend${card.trendColor.charAt(0).toUpperCase() + card.trendColor.slice(1)}`] : ''}`}>
                    {card.value}
                  </span>
                  <span className={`${styles.analyticsKpiChange} ${card.down ? 'down' : 'up'}`}>
                    {card.down ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                    {card.change}
                  </span>
                  <div className={styles.analyticsKpiIcon} style={{ background: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                  {showFormula === card.key && (
                    <div className={styles.formulaTooltip}>{FORMULAS[card.key]?.formula || card.change}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Value Across Locations ── */}
          {locationBreakdownData.length > 0 && (
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Value Across Locations</h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    {activeColumn?.columnName} breakdown by location — Total, Average & Count
                  </p>
                </div>
                <div className={styles.cardActions}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#16a34a', marginRight: 4 }} />Total</span>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#22c55e', marginRight: 4 }} />Average</span>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#86efac', marginRight: 4 }} />Count</span>
                  </div>
                  <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
                </div>
              </div>
              {renderLocationChart()}
            </div>
          )}

          {/* ── Main Grid: Forecast + Regional + Market Survey ── */}
          <div className={styles.mainGrid}>
            <div className={styles.mainChartCol}>
              {forecastData.length > 0 && (
                <div className={styles.chartCard}>
                  <div className={styles.cardHeader}>
                    <h3>Forecast (Next {activeAnalysis.forecast.length} Periods)</h3>
                    <div className={styles.cardActions}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
                        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#16a34a', marginRight: 4 }} />Actual</span>
                        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#f97316', marginRight: 4 }} />Forecast</span>
                      </div>
                      <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
                    </div>
                  </div>
                  <div className={styles.formulaHint}><Info size={10} /> {FORMULAS.forecast.formula}</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <ReLineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltipStyle} formatter={(v: any) => [v !== null && v !== undefined ? formatNumber(Number(v)) : '-', '']} />
                      <Legend iconType="circle" iconSize={8} />
                      <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} dot={{ r: 2 }} name="Actual" />
                      <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#f97316' }} name="Forecast" />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className={styles.sidePanelsCol}>
              {regionalDistData.length > 0 && (
                <div className={styles.chartCard}>
                  <div className={styles.cardHeader}>
                    <h3>Regional Distribution</h3>
                    <div className={styles.cardActions}><button className={styles.moreBtn}><MoreHorizontal size={16} /></button></div>
                  </div>
                  <ResponsiveContainer width="100%" height={150}>
                    <RePieChart>
                      <Pie data={regionalDistData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={4}>
                        {regionalDistData.map((_, i) => <Cell key={i} fill={SURVEY_COLORS[i % SURVEY_COLORS.length]} stroke="none" />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaf0', fontSize: 13 }} />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className={styles.regionLegend}>
                    {regionalDistData.map((r: any, i: number) => (
                      <div key={r.name} className={styles.regionItem}>
                        <span className={styles.regionDot} style={{ background: SURVEY_COLORS[i % SURVEY_COLORS.length] }} />
                        <span className={styles.regionName}>{r.name}</span>
                        <span className={styles.regionValue}>{formatNumber(r.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {marketSurveyData.length > 0 && (
                <div className={styles.chartCard}>
                  <div className={styles.cardHeader}>
                    <h3>Column Comparison Scores</h3>
                    <div className={styles.cardActions}><button className={styles.moreBtn}><MoreHorizontal size={16} /></button></div>
                  </div>
                  <div className={styles.surveyList}>
                    {marketSurveyData.map((item: any) => (
                      <div key={item.category} className={styles.surveyItem}>
                        <div className={styles.surveyHeader}>
                          <TrendingUp size={13} strokeWidth={2} color="#16a34a" />
                          <span className={styles.surveyCategory}>{item.category}</span>
                          <span className={styles.surveyRevenue}>{item.category === activeColumn?.columnName ? '★ Selected' : `$${item.revenue}K`}</span>
                        </div>
                        <div className={styles.surveyBarTrack}>
                          <div className={styles.surveyBarFill} style={{ width: `${item.satisfaction}%` }} />
                        </div>
                        <span className={styles.surveyPercent}>{item.satisfaction}% R²/Trend score</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Data Table ── */}
          {filteredData.length > 0 && (
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <h3>Data View ({filteredData.length} rows)</h3>
                <div className={styles.cardActions}>
                  <div className={styles.formulaHint} style={{ marginRight: 8 }}><Info size={10} /> {FORMULAS.movingAvg.formula}</div>
                  <button className={styles.viewAll}>View All</button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Label</th>
                      <th>Value</th>
                      {activeAnalysis && <th>Moving Avg (w=3)</th>}
                      {activeAnalysis && <th>Growth Rate</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{row.label}</td>
                        <td>{formatNumber(row.value)}</td>
                        {activeAnalysis && <td>{row.movingAvg !== null ? formatNumber(row.movingAvg) : '-'}</td>}
                        {activeAnalysis && (
                          <td>{activeAnalysis.growthRate[i] !== undefined ? (activeAnalysis.growthRate[i] >= 0 ? '+' : '') + activeAnalysis.growthRate[i].toFixed(1) + '%' : '-'}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Recent Data Entries ── */}
          {recentTransactions.length > 0 && (
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <h3>Recent Data Entries</h3>
                <div className={styles.cardActions}><button className={styles.viewAll}>View All</button></div>
              </div>
              <div className={styles.transactionTable}>
                <div className={styles.tableHeader}>
                  <span>#</span>
                  <span>Identifier</span>
                  <span>Value</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                {recentTransactions.map((tx, i) => (
                  <div key={i} className={styles.tableRow}>
                    <span className={styles.invoiceId}>{tx.id}</span>
                    <span className={styles.customerName}>{tx.customer}</span>
                    <span className={styles.amount}>{formatNumber(tx.amount)}</span>
                    <span className={`${styles.status} ${styles[tx.status?.toLowerCase() || 'completed']}`}>
                      {tx.status === 'Completed' && <CheckCircle2 size={12} />}
                      {tx.status === 'Processing' && <Activity size={12} />}
                      {tx.status === 'Pending' && <Clock size={12} />}
                      {tx.status || 'Completed'}
                    </span>
                    <span className={styles.date}>{tx.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Formula Reference ── */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Formula Reference</h3>
              <div className={styles.cardActions}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                  Click <Info size={10} style={{ verticalAlign: 'middle' }} /> icon on any metric card
                </span>
              </div>
            </div>
            <div className={styles.formulaGrid}>
              {Object.entries(FORMULAS).map(([key, val]) => (
                <div key={key} className={styles.formulaItem}>
                  <span className={styles.formulaItemLabel}>{val.label}</span>
                  <span className={styles.formulaItemFormula}>{val.formula}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <BarChart3 size={48} className={styles.emptyIcon} />
          <div className={styles.emptyText}>No analysis data available</div>
          <div className={styles.emptyHint}>Upload data in User Data page first to see analyzed columns here</div>
        </div>
      )}
    </PageShell>
  )
}