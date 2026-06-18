import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BarChart3, TrendingUp, TrendingDown, Activity,
  AreaChart as AreaChartIcon, BarChart, LineChart, PieChart,
  Calendar, MapPin, Download, Table2, RefreshCw
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

/* ── Palette for Pie ── */
const COLORS = ['#16a34a', '#2563eb', '#f97316', '#8b5cf6', '#dc2626', '#14b8a6', '#f59e0b', '#ec4899']

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

  // Find the active column info
  const activeColumn = useMemo(
    () => allColumns.find(c => c.id === columnId),
    [allColumns, columnId]
  )

  // Load all analyzed columns + full dataset
  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Get analyzed columns list
      const colsRes = await api.get('/trend/analyzed-columns')
      setAllColumns(colsRes.data)

      // If we have a columnId, find which dataset it belongs to
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

  // Extract unique "places" from rawPreview (look for location-like columns)
  const placeOptions = useMemo(() => {
    if (!fullDataset) return ['all']
    const preview = fullDataset.rawPreview
    if (preview.length === 0) return ['all']

    // Find columns that look like location/place/region/city/country
    const locationCol = fullDataset.columnNames.find(k =>
      /place|location|region|city|country|state|area|zone|branch|office|store|dept/i.test(k)
    )

    if (locationCol) {
      const unique = [...new Set(preview.map(r => String(r[locationCol] ?? '')).filter(Boolean))]
      return unique.length > 0 ? ['all', ...unique] : ['all']
    }

    return ['all']
  }, [fullDataset])

  // Get the active analysis for the column
  const activeAnalysis = useMemo<TrendDetail | null>(() => {
    if (!fullDataset || !activeColumn) return null
    return fullDataset.analysis[activeColumn.columnName] ?? null
  }, [fullDataset, activeColumn])

  // Filter data based on time and place
  const filteredData = useMemo(() => {
    if (!activeAnalysis) return []

    const { rawData, labels } = activeAnalysis
    const combined = rawData.map((v, i) => ({
      label: labels[i] || `#${i + 1}`,
      value: v,
      movingAvg: activeAnalysis.movingAverage?.[i] ?? null,
    }))

    // Apply place filter on rawPreview if available
    if (placeFilter !== 'all' && fullDataset) {
      const locationCol = fullDataset.columnNames.find(k =>
        /place|location|region|city|country|state|area|zone|branch|office|store|dept/i.test(k)
      )
      if (locationCol) {
        const filteredPreview = fullDataset.rawPreview.filter(
          r => String(r[locationCol] ?? '') === placeFilter
        )
        // If filtered, re-build data from the filtered preview
        if (filteredPreview.length > 0) {
          const col = activeColumn!.columnName
          const filteredValues = filteredPreview
            .map(r => Number(r[col]))
            .filter(n => !isNaN(n))

          if (filteredValues.length > 0) {
            return filteredValues.map((v, i) => ({
              label: `#${i + 1}`,
              value: v,
              movingAvg: null,
            }))
          }
        }
      }
    }

    // Apply time filter (slice data based on count)
    const { end } = getDateRange(timeFilter)
    if (timeFilter !== 'all') {
      const count = Math.max(1, Math.floor(combined.length / 12) || 1)
      const limit =
        timeFilter === 'today' ? Math.min(combined.length, 24) :
        timeFilter === 'week' ? Math.min(combined.length, 7) :
        timeFilter === 'month' ? Math.min(combined.length, 30) :
        Math.min(combined.length, 365)

      return combined.slice(-limit)
    }

    return combined
  }, [activeAnalysis, timeFilter, placeFilter, fullDataset, activeColumn])

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
          <ResponsiveContainer width="100%" height={340}>
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
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#areaGrad)" strokeWidth={2} name="Value" />
              {activeAnalysis && (
                <Area type="monotone" dataKey="movingAvg" stroke="#2563eb" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Moving Avg" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={340}>
            <ReBarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="value" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={28} name="Value" />
            </ReBarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={340}>
            <ReLineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} name="Value" />
              {activeAnalysis && (
                <Line type="monotone" dataKey="movingAvg" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Moving Avg" />
              )}
            </ReLineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const pieData = filteredData.map(d => ({ name: d.label, value: Math.abs(d.value) }))
        return (
          <ResponsiveContainer width="100%" height={340}>
            <RePieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={50}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
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
      title={activeColumn ? `Analysis: ${activeColumn.columnName}` : 'Analytical View'}
      subtitle={activeColumn ? `From dataset: ${activeColumn.datasetName}` : 'Detailed analysis of your data columns'}
    >
      {/* ── Column Info Header ── */}
      {activeColumn && (
        <div className={styles.columnInfo}>
          <span className={styles.columnInfoName}>{activeColumn.columnName}</span>
          <span className={styles.columnInfoDataset}>from {activeColumn.datasetName}</span>
          <span className={`${styles.columnInfoBadge} ${
            activeColumn.trend === 'up' ? styles.badgeUp :
            activeColumn.trend === 'down' ? styles.badgeDown : styles.badgeStable
          }`}>
            {activeColumn.trend === 'up' && <TrendingUp size={12} style={{ marginRight: 2, verticalAlign: 'middle' }} />}
            {activeColumn.trend === 'down' && <TrendingDown size={12} style={{ marginRight: 2, verticalAlign: 'middle' }} />}
            {activeColumn.trend === 'stable' && <Activity size={12} style={{ marginRight: 2, verticalAlign: 'middle' }} />}
            {activeColumn.trendPercentage > 0 ? '+' : ''}{activeColumn.trendPercentage.toFixed(1)}%
          </span>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className={styles.filterBar}>
        {/* Time Filter */}
        <span className={styles.filterLabel}><Calendar size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} /> Time:</span>
        <div className={styles.filterGroup}>
          {(['all', 'today', 'week', 'month', 'year'] as TimeFilter[]).map(ft => (
            <button
              key={ft}
              className={`${styles.filterBtn} ${timeFilter === ft ? styles.active : ''}`}
              onClick={() => setTimeFilter(ft)}
            >
              {ft === 'all' ? 'All Time' : ft.charAt(0).toUpperCase() + ft.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.filterDivider} />

        {/* Place Filter */}
        <span className={styles.filterLabel}><MapPin size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} /> Place:</span>
        <div className={styles.placeFilter}>
          <select
            className={styles.placeSelect}
            value={placeFilter}
            onChange={(e) => setPlaceFilter(e.target.value)}
          >
            {placeOptions.map(p => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Locations' : p}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterDivider} />

        {/* Chart Type Selector */}
        <span className={styles.filterLabel}><BarChart3 size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} /> Chart:</span>
        <div className={styles.chartTypeBar}>
          <button
            className={`${styles.chartTypeBtn} ${chartType === 'area' ? styles.active : ''}`}
            onClick={() => setChartType('area')}
          >
            <AreaChartIcon size={14} /> Area
          </button>
          <button
            className={`${styles.chartTypeBtn} ${chartType === 'bar' ? styles.active : ''}`}
            onClick={() => setChartType('bar')}
          >
            <BarChart size={14} /> Bar
          </button>
          <button
            className={`${styles.chartTypeBtn} ${chartType === 'line' ? styles.active : ''}`}
            onClick={() => setChartType('line')}
          >
            <LineChart size={14} /> Line
          </button>
          <button
            className={`${styles.chartTypeBtn} ${chartType === 'pie' ? styles.active : ''}`}
            onClick={() => setChartType('pie')}
          >
            <PieChart size={14} /> Pie
          </button>
        </div>

        {/* Refresh Button */}
        <button
          className={styles.chartTypeBtn}
          onClick={loadData}
          title="Refresh data"
          style={{ marginLeft: 'auto' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          Loading analysis...
        </div>
      ) : activeAnalysis ? (
        <>
          {/* ── Main Content: Chart + Stats ── */}
          <div className={styles.mainContent}>
            {/* Chart Panel */}
            <div className={styles.chartPanel}>
              <div className={styles.chartPanelTitle}>
                <BarChart3 size={16} />
                {chartType === 'area' ? 'Area Chart' :
                 chartType === 'bar' ? 'Bar Chart' :
                 chartType === 'line' ? 'Line Chart' : 'Pie Chart'}
                {timeFilter !== 'all' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 400, marginLeft: 8 }}>
                    ({timeFilter === 'today' ? 'Today' :
                      timeFilter === 'week' ? 'This Week' :
                      timeFilter === 'month' ? 'This Month' : 'This Year'}
                    {placeFilter !== 'all' && ` - ${placeFilter}`})
                  </span>
                )}
              </div>
              <div className={styles.chartWrapper}>
                {renderChart()}
              </div>
            </div>

            {/* Statistics Panel */}
            <div className={styles.statsPanel}>
              <div className={styles.statsPanelTitle}>
                <Table2 size={16} />
                Statistics Summary
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Mean</div>
                  <div className={styles.statValue}>{formatNumber(activeAnalysis.mean)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Median</div>
                  <div className={styles.statValue}>{formatNumber(activeAnalysis.median)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Std Dev</div>
                  <div className={styles.statValue}>{formatNumber(activeAnalysis.stdDev)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Variance</div>
                  <div className={styles.statValue}>{formatNumber(activeAnalysis.variance)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Min</div>
                  <div className={styles.statValue}>{formatNumber(activeAnalysis.min)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Max</div>
                  <div className={styles.statValue}>{formatNumber(activeAnalysis.max)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Range</div>
                  <div className={styles.statValue}>{formatNumber(activeAnalysis.range)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>
                    Trend
                    {activeAnalysis.trend === 'up' && <TrendingUp size={12} style={{ marginLeft: 3, verticalAlign: 'middle', color: '#16a34a' }} />}
                    {activeAnalysis.trend === 'down' && <TrendingDown size={12} style={{ marginLeft: 3, verticalAlign: 'middle', color: '#dc2626' }} />}
                    {activeAnalysis.trend === 'stable' && <Activity size={12} style={{ marginLeft: 3, verticalAlign: 'middle', color: '#d97706' }} />}
                  </div>
                  <div className={`${styles.statValue} ${
                    activeAnalysis.trend === 'up' ? styles.trendUp :
                    activeAnalysis.trend === 'down' ? styles.trendDown : styles.trendStable
                  }`}>
                    {activeAnalysis.trendPercentage > 0 ? '+' : ''}{activeAnalysis.trendPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>R² Fit</div>
                  <div className={styles.statValue}>{activeAnalysis.linearRegression.r2.toFixed(4)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>CGR</div>
                  <div className={styles.statValue}>{activeAnalysis.compoundGrowthRate.toFixed(2)}%</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Slope</div>
                  <div className={styles.statValue}>{formatNumber(activeAnalysis.linearRegression.slope)}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Data Points</div>
                  <div className={styles.statValue}>{activeAnalysis.rawData.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Forecast Panel ── */}
          {forecastData.length > 0 && (
            <div className={styles.chartPanel}>
              <div className={styles.chartPanelTitle}>
                <TrendingUp size={16} />
                Forecast (Next {activeAnalysis.forecast.length} Periods)
              </div>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={220}>
                  <ReLineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <Legend iconType="circle" iconSize={8} />
                    <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} dot={{ r: 2 }} name="Actual" />
                    <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#f97316' }} name="Forecast" />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Data Table ── */}
          {filteredData.length > 0 && (
            <div className={styles.chartPanel}>
              <div className={styles.chartPanelTitle}>
                <Table2 size={16} />
                Data View ({filteredData.length} rows)
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Label</th>
                      <th>Value</th>
                      {activeAnalysis && <th>Moving Avg</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{row.label}</td>
                        <td>{formatNumber(row.value)}</td>
                        {activeAnalysis && <td>{row.movingAvg !== null ? formatNumber(row.movingAvg) : '-'}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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