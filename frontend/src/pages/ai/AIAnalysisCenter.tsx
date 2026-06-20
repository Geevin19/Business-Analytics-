import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Brain, TrendingUp, TrendingDown, Zap, AlertTriangle,
  Globe2, MessageSquare, RefreshCw, Send, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Target, BarChart3,
  Lightbulb, Activity, MapPin, Clock, CheckCircle2,
  Search, Download, Loader2, Info,
  FileDown, ExternalLink
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
import api from '@/services/api'
import styles from './AIAnalysisCenter.module.css'

// ── Types ────────────────────────────────────────────────────────────────
interface TrendResult {
  rawData: number[]
  labels: string[]
  mean: number; median: number; min: number; max: number
  stdDev: number; variance: number; range: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  movingAverage: number[]
  forecast: number[]
  linearRegression: { slope: number; intercept: number; r2: number }
  growthRate: number[]
  compoundGrowthRate: number
  seasonalIndex: number[]
}

interface Dataset {
  id: string; fileName: string; rowCount: number
  columnNames: string[]; numericColumns: string[]
  analysis: Record<string, TrendResult>
  rawPreview: Record<string, any>[]
  locationColumns?: string[]
  locationAnalysis?: Record<string, Record<string, TrendResult>>
}

interface Insight { type: 'positive' | 'negative' | 'neutral' | 'warning'; text: string; value?: string }
interface Anomaly { severity: 'High' | 'Medium' | 'Low'; column: string; description: string; value: string; time: string }
interface Recommendation { priority: 'High' | 'Medium' | 'Low'; title: string; desc: string; impact: string }
interface RegionStat { region: string; total: number; avg: number; trend: 'up' | 'down' | 'stable'; growth: number }
interface ChatMessage { role: 'user' | 'ai'; text: string; time: string }

// ── Helpers ───────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)
}

function pct(n: number) { return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%` }

const COLORS = ['#16a34a','#22c55e','#2563eb','#f97316','#8b5cf6','#dc2626','#f59e0b','#06b6d4']
const ttip = { contentStyle: { borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 } }
const axis = { axisLine: false as const, tickLine: false as const }

/** Apply time filter by slicing raw data */
function applyTimeFilter<T>(data: T[], labels: string[], time: string): { filtered: T[]; filteredLabels: string[] } {
  if (time === 'all') return { filtered: data, filteredLabels: labels }
  const countMap: Record<string, number> = {
    'year': 52,   // ~1 year of weekly data
    'month': 12,  // ~1 month
    'week': 7,    // 1 week
    'today': 1,
  }
  const take = Math.min(countMap[time] || data.length, data.length)
  return { filtered: data.slice(-take), filteredLabels: labels.slice(-take) }
}

/** Get filtered analysis result scoped by location, column, and time */
function getFilteredAnalysis(ds: Dataset, col: string, location: string, time: string): TrendResult | null {
  const a = (location !== 'all' && ds.locationAnalysis?.[location])
    ? ds.locationAnalysis[location][col]
    : ds.analysis[col]
  if (!a) return null
  // Apply time filter by re-computing stats on the sliced data
  const { filtered } = applyTimeFilter(a.rawData, a.labels, time)
  if (filtered.length === 0) return null
  if (filtered.length === a.rawData.length) return a // no change needed

  // Recompute basic stats on filtered data
  const fMean = filtered.reduce((s, v) => s + v, 0) / filtered.length
  const fMedian = (() => { const s = [...filtered].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m] })()
  const fStdDev = Math.sqrt(filtered.reduce((s, v) => s + (v - fMean) ** 2, 0) / filtered.length)
  const trendPct = filtered.length >= 2 ? ((filtered[filtered.length - 1] - filtered[0]) / Math.abs(filtered[0] || 1)) * 100 : 0
  const fTrend: 'up' | 'down' | 'stable' = trendPct > 5 ? 'up' : trendPct < -5 ? 'down' : 'stable'
  return {
    ...a,
    rawData: filtered,
    mean: fMean,
    median: fMedian,
    min: Math.min(...filtered),
    max: Math.max(...filtered),
    stdDev: fStdDev,
    variance: fStdDev * fStdDev,
    range: Math.max(...filtered) - Math.min(...filtered),
    trend: fTrend,
    trendPercentage: Math.round(trendPct * 100) / 100,
  }
}

/** Filter anomalies to only show those within the time range */
function filterAnomaliesByTime(anomalies: Anomaly[], time: string): Anomaly[] {
  if (time === 'all') return anomalies
  const now = Date.now()
  const timeMs: Record<string, number> = {
    'today': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    'year': 365 * 24 * 60 * 60 * 1000,
  }
  const maxAge = timeMs[time] || Infinity
  // Parse time from anomaly.time - if not parseable, keep it
  return anomalies.filter(a => {
    if (!a.time || a.time.startsWith('Point')) return true
    const ts = new Date(a.time).getTime()
    if (isNaN(ts)) return true
    return (now - ts) <= maxAge
  })
}

// ── AI Engine (runs entirely from local dataset math) ─────────────────────
function generateInsights(datasets: Dataset[], filters: { time: string; location: string; column: string }): Insight[] {
  const insights: Insight[] = []
  datasets.forEach(ds => {
    const cols = filters.column !== 'all'
      ? ds.numericColumns.filter(c => c === filters.column)
      : ds.numericColumns
    cols.forEach(col => {
      const a = getFilteredAnalysis(ds, col, filters.location, filters.time)
      if (!a) return
      const t = a.trendPercentage
      if (t > 20) insights.push({ type: 'positive', text: `${col} is showing strong growth`, value: pct(t) })
      else if (t > 5) insights.push({ type: 'positive', text: `${col} is trending upward`, value: pct(t) })
      else if (t < -20) insights.push({ type: 'negative', text: `${col} has declined significantly`, value: pct(t) })
      else if (t < -5) insights.push({ type: 'negative', text: `${col} shows a declining trend`, value: pct(t) })
      else insights.push({ type: 'neutral', text: `${col} remains stable`, value: pct(t) })
      if (a.stdDev > a.mean * 0.5) insights.push({ type: 'warning', text: `High volatility detected in ${col}`, value: `σ=${fmt(a.stdDev)}` })
      if (a.linearRegression.r2 < 0.3) insights.push({ type: 'warning', text: `${col} shows irregular pattern (R²=${a.linearRegression.r2.toFixed(2)})`, value: '' })
    })
  })
  return insights.slice(0, 12)
}

function generateAnomalies(datasets: Dataset[], filters: { time: string; location: string; column: string }): Anomaly[] {
  const anomalies: Anomaly[] = []
  datasets.forEach(ds => {
    const cols = filters.column !== 'all' ? ds.numericColumns.filter(c => c === filters.column) : ds.numericColumns
    cols.forEach(col => {
      const a = getFilteredAnalysis(ds, col, filters.location, filters.time)
      if (!a || a.rawData.length < 3) return
      const mean = a.mean; const sd = a.stdDev
      a.rawData.forEach((v, i) => {
        const z = Math.abs((v - mean) / (sd || 1))
        if (z > 3) anomalies.push({ severity: 'High', column: col, description: `Extreme outlier detected (z=${z.toFixed(1)})`, value: fmt(v), time: a.labels[i] || `Point ${i + 1}` })
        else if (z > 2) anomalies.push({ severity: 'Medium', column: col, description: `Unusual spike detected (z=${z.toFixed(1)})`, value: fmt(v), time: a.labels[i] || `Point ${i + 1}` })
      })
    })
  })
  return anomalies.slice(0, 10)
}

function generateRecommendations(datasets: Dataset[], filters: { time: string; location: string }): Recommendation[] {
  const recs: Recommendation[] = []
  datasets.forEach(ds => {
    ds.numericColumns.forEach(col => {
      const a = filters.location !== 'all' && ds.locationAnalysis?.[filters.location]
        ? ds.locationAnalysis[filters.location][col]
        : ds.analysis[col]
      if (!a) return
      if (a.trendPercentage < -15) recs.push({ priority: 'High', title: `Investigate ${col} decline`, desc: `${col} dropped ${pct(a.trendPercentage)}. Review pricing, demand, and competition factors.`, impact: 'Revenue Recovery' })
      if (a.compoundGrowthRate > 20) recs.push({ priority: 'High', title: `Scale up ${col}`, desc: `${col} growing at ${pct(a.compoundGrowthRate)} CGR. Consider increasing capacity and investment.`, impact: 'Growth Acceleration' })
      if (a.stdDev > a.mean * 0.6) recs.push({ priority: 'Medium', title: `Stabilize ${col}`, desc: `High volatility in ${col}. Implement smoothing strategies to reduce fluctuation.`, impact: 'Risk Reduction' })
      if (a.linearRegression.r2 > 0.85 && a.trendPercentage > 5) recs.push({ priority: 'Medium', title: `Forecast and plan for ${col}`, desc: `Strong predictable trend. Use forecasting to optimize inventory and staffing.`, impact: 'Operational Efficiency' })
    })
    if (ds.locationColumns && ds.locationColumns.length > 0 && ds.locationAnalysis) {
      const locScores = Object.entries(ds.locationAnalysis).map(([loc, la]) => {
        const col = ds.numericColumns[0]; const a = la[col]
        return a ? { loc, score: a.trendPercentage } : null
      }).filter(Boolean) as { loc: string; score: number }[]
      if (locScores.length > 1) {
        const worst = locScores.sort((a, b) => a.score - b.score)[0]
        recs.push({ priority: 'Low', title: `Attention needed: ${worst.loc}`, desc: `${worst.loc} is the lowest-performing region. Consider targeted strategies or resource reallocation.`, impact: 'Regional Growth' })
      }
    }
  })
  return recs.slice(0, 8)
}

function generateRegionStats(datasets: Dataset[]): RegionStat[] {
  const stats: RegionStat[] = []
  datasets.forEach(ds => {
    if (!ds.locationAnalysis || !ds.locationColumns?.length) return
    const col = ds.numericColumns[0]; if (!col) return
    Object.entries(ds.locationAnalysis).forEach(([region, la]) => {
      const a = la[col]; if (!a) return
      stats.push({ region, total: a.rawData.reduce((s, v) => s + v, 0), avg: a.mean, trend: a.trend, growth: a.trendPercentage })
    })
  })
  return stats.sort((a, b) => b.total - a.total).slice(0, 8)
}

function generateForecastChart(datasets: Dataset[], col: string, location: string, time: string): { month: string; actual: number | null; forecast: number | null }[] {
  const ds = datasets[0]; if (!ds) return []
  const a = getFilteredAnalysis(ds, col, location, time)
  if (!a) return []
  const actual = a.rawData.slice(-12).map((v, i) => ({ month: a.labels[a.rawData.length - 12 + i] || `P${i + 1}`, actual: v, forecast: null as number | null }))
  const future = a.forecast.slice(0, 6).map((v, i) => ({ month: `F${i + 1}`, actual: null as number | null, forecast: v }))
  return [...actual, ...future]
}

// ── Answer question from data ─────────────────────────────────────────────
function answerQuestion(q: string, datasets: Dataset[], filters: { time: string; location: string }): string {
  if (!datasets.length) return "No datasets are loaded. Please upload a dataset first to enable AI analysis."
  const lower = q.toLowerCase()
  const ds = datasets[0]
  const col = ds.numericColumns.find(c => lower.includes(c.toLowerCase())) || ds.numericColumns[0]
  const a = (filters.location !== 'all' && ds.locationAnalysis?.[filters.location])
    ? ds.locationAnalysis[filters.location][col]
    : ds.analysis[col]
  if (!a) return `I found dataset "${ds.fileName}" but could not find analysis for "${col}".`

  if (/decrease|decline|drop|fall|lower|worst/i.test(q)) {
    if (a.trendPercentage < 0)
      return `📉 ${col} decreased by ${pct(a.trendPercentage)} over the analysis period. The mean dropped to ${fmt(a.mean)} with a standard deviation of ${fmt(a.stdDev)}, indicating ${a.stdDev > a.mean * 0.3 ? 'high' : 'moderate'} volatility. The linear regression slope is ${a.linearRegression.slope.toFixed(3)}, confirming a declining trend. Possible causes include market saturation, seasonal factors, or reduced demand.${filters.location !== 'all' ? ` (Filtered by location: ${filters.location})` : ''}`
    return `📊 ${col} has not declined — it ${a.trend === 'up' ? 'grew by' : 'remained stable at'} ${pct(a.trendPercentage)}. The mean is ${fmt(a.mean)}.${filters.location !== 'all' ? ` (Filtered by location: ${filters.location})` : ''}`
  }

  if (/highest|best|top|max|peak/i.test(q)) {
    if (ds.locationAnalysis && filters.location === 'all') {
      const scores = Object.entries(ds.locationAnalysis).map(([loc, la]) => ({ loc, v: la[col]?.mean || 0 })).sort((a, b) => b.v - a.v)
      if (scores.length) return `🏆 The highest-performing location for ${col} is **${scores[0].loc}** with an average of ${fmt(scores[0].v)}. This is ${((scores[0].v / a.mean - 1) * 100).toFixed(1)}% above the overall average of ${fmt(a.mean)}.`
    }
    return `📈 The maximum value for ${col} is ${fmt(a.max)}, occurring at point ${a.rawData.indexOf(a.max) + 1} (${a.labels[a.rawData.indexOf(a.max)] || 'unknown'}). The overall mean is ${fmt(a.mean)}.`
  }

  if (/predict|forecast|next|future|quarter|month/i.test(q)) {
    const nextVals = a.forecast.slice(0, 3)
    return `🔮 Based on linear regression (R²=${a.linearRegression.r2.toFixed(2)}), the forecast for the next 3 periods is: ${nextVals.map((v, i) => `Period ${i + 1}: ${fmt(v)}`).join(', ')}. Current CGR is ${pct(a.compoundGrowthRate)}. ${a.linearRegression.r2 > 0.7 ? 'High confidence in this forecast.' : 'Low confidence — consider external factors.'}`
  }

  if (/focus|product|best|invest|opportunit/i.test(q)) {
    const ranked = ds.numericColumns.map(c => ({ c, score: ds.analysis[c]?.trendPercentage || 0 })).sort((a, b) => b.score - a.score)
    return `🎯 Based on trend analysis, focus on **${ranked[0].c}** (${pct(ranked[0].score)} trend). It shows the strongest growth trajectory${a.linearRegression.r2 > 0.7 ? ' with high predictability' : ''}. ${ranked[1] ? `Runner-up: ${ranked[1].c} at ${pct(ranked[1].score)}.` : ''}`
  }

  if (/segment|customer|group|categor/i.test(q)) {
    if (ds.locationAnalysis) {
      const scores = Object.entries(ds.locationAnalysis).map(([loc, la]) => ({ loc, growth: la[col]?.trendPercentage || 0 })).sort((a, b) => b.growth - a.growth)
      return `👥 The fastest-growing segment/region is **${scores[0]?.loc || 'N/A'}** with ${pct(scores[0]?.growth || 0)} growth. ${scores.length > 1 ? `Slowest: ${scores[scores.length - 1].loc} at ${pct(scores[scores.length - 1].growth)}.` : ''}`
    }
    return `The dataset has ${ds.rowCount} records across ${ds.numericColumns.length} numeric columns. ${col} shows a ${a.trend} trend (${pct(a.trendPercentage)}).`
  }

  return `📊 Analysis for **${col}** from "${ds.fileName}" (${ds.rowCount} records):\n• Trend: ${a.trend.toUpperCase()} (${pct(a.trendPercentage)})\n• Mean: ${fmt(a.mean)} | Min: ${fmt(a.min)} | Max: ${fmt(a.max)}\n• Std Dev: ${fmt(a.stdDev)} | CGR: ${pct(a.compoundGrowthRate)}\n• Forecast (next period): ${fmt(a.forecast[0] || 0)}\n• Model fit R²: ${a.linearRegression.r2.toFixed(3)}${filters.location !== 'all' ? `\n• Location filter: ${filters.location}` : ''}`
}

// ── Export helpers ─────────────────────────────────────────────────────────
function exportToCSV(data: { label: string; value: number; ma?: number | null }[], filename: string) {
  const header = 'Label,Value,Moving Average\n'
  const rows = data.map(d => `${d.label},${d.value ?? ''},${d.ma ?? ''}`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function exportInsightsToCSV(insights: Insight[]) {
  const header = 'Type,Insight,Value\n'
  const rows = insights.map(i => `${i.type},"${i.text}","${i.value || ''}"`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `ai-insights-${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ── TABS ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'insights', label: 'AI Insights', icon: Lightbulb },
  { id: 'trends', label: 'Trend Detection', icon: TrendingUp },
  { id: 'forecast', label: 'Forecasting', icon: Target },
  { id: 'recommendations', label: 'Recommendations', icon: Zap },
  { id: 'anomalies', label: 'Anomaly Alerts', icon: AlertTriangle },
  { id: 'regional', label: 'Regional Intel', icon: Globe2 },
  { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
]

const CHART_TYPES = ['Area', 'Bar', 'Line', 'Pie'] as const

// ── Main Component ─────────────────────────────────────────────────────────
export default function AIAnalysisCenter() {
  const [activeTab, setActiveTab] = useState('insights')
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({ time: 'all', location: 'all', column: 'all' })
  const [trendChartType, setTrendChartType] = useState<typeof CHART_TYPES[number]>('Area')
  const [forecastChartType, setForecastChartType] = useState<typeof CHART_TYPES[number]>('Area')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: "Hi! I'm your AI Business Assistant. Ask me anything about your uploaded data — trends, forecasts, anomalies, or business recommendations.", time: new Date().toLocaleTimeString() }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const notificationTimer = useRef<ReturnType<typeof setTimeout>>()

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type })
    if (notificationTimer.current) clearTimeout(notificationTimer.current)
    notificationTimer.current = setTimeout(() => setNotification(null), 3000)
  }, [])

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true)
    try {
      const res = await api.get('/trend/datasets')
      setDatasets(res.data || [])
    } catch { setDatasets([]) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  // Derived values
  const allLocations = datasets.flatMap(ds => Object.keys(ds.locationAnalysis || {}))
  const uniqueLocations = [...new Set(allLocations)]
  const allColumns = datasets.flatMap(ds => ds.numericColumns)
  const uniqueColumns = [...new Set(allColumns)]

  const insights = generateInsights(datasets, filters)
  const anomalies = filterAnomaliesByTime(generateAnomalies(datasets, filters), filters.time)
  const recommendations = generateRecommendations(datasets, filters)
  const regionStats = generateRegionStats(datasets)
  const activeCol = filters.column !== 'all' ? filters.column : (datasets[0]?.numericColumns[0] || '')
  const forecastData = generateForecastChart(datasets, activeCol, filters.location, filters.time)

  // Get filtered trend data
  const trendAnalysis = getFilteredAnalysis(datasets[0] || {} as Dataset, activeCol, filters.location, filters.time)
  const trendData = trendAnalysis?.rawData.slice(-20).map((v, i) => {
    const aIdx = trendAnalysis.rawData.length - 20 + i
    return {
      label: trendAnalysis.labels[aIdx] || `P${i + 1}`,
      value: v,
      ma: trendAnalysis.movingAverage[Math.max(0, i - 2)] ?? null
    }
  }) || []

  // Send chat message
  async function sendChat(text?: string) {
    const q = (text || chatInput).trim(); if (!q) return
    const userMsg: ChatMessage = { role: 'user', text: q, time: new Date().toLocaleTimeString() }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const answer = answerQuestion(q, datasets, filters)
    setChatMessages(prev => [...prev, { role: 'ai', text: answer, time: new Date().toLocaleTimeString() }])
    setChatLoading(false)
  }

  function handleSuggestion(q: string) {
    setChatInput(q)
    // Auto-send after a brief delay to show the input
    setTimeout(() => sendChat(q), 100)
  }

  async function handleExport() {
    if (activeTab === 'insights' || activeTab === 'all') {
      exportInsightsToCSV(insights)
      showNotification('Insights exported as CSV', 'success')
    } else if (activeTab === 'trends' && trendData.length > 0) {
      exportToCSV(trendData, `trend-data-${activeCol}-${Date.now()}.csv`)
      showNotification('Trend data exported as CSV', 'success')
    } else {
      exportInsightsToCSV(insights)
      showNotification('Analysis data exported', 'success')
    }
  }

  const noData = !loading && datasets.length === 0

  // Compute overall analysis for the first page
  const overallGrowing = insights.filter(i => i.type === 'positive').length
  const overallDeclining = insights.filter(i => i.type === 'negative').length
  const overallWarnings = insights.filter(i => i.type === 'warning').length
  const overallStable = insights.filter(i => i.type === 'neutral').length
  const totalAnomalies = anomalies.length
  const totalRecommendations = recommendations.length
  const totalRegions = regionStats.length
  // Best performing column
  const bestCol = datasets[0]?.numericColumns.map(c => ({ name: c, score: datasets[0].analysis[c]?.trendPercentage || 0 })).sort((a, b) => b.score - a.score)[0]
  // Worst performing column
  const worstCol = datasets[0]?.numericColumns.map(c => ({ name: c, score: datasets[0].analysis[c]?.trendPercentage || 0 })).sort((a, b) => a.score - b.score)[0]
  // Top region
  const topRegion = regionStats[0]

  return (
    <div className={styles.page}>
      {/* ── Notification Toast ── */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: 10,
          background: notification.type === 'success' ? '#dcfce7' : notification.type === 'warning' ? '#fef3c7' : '#dbeafe',
          color: notification.type === 'success' ? '#16a34a' : notification.type === 'warning' ? '#d97706' : '#2563eb',
          fontSize: '0.85rem', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'slideIn 0.3s ease',
        }}>
          <CheckCircle2 size={16} />
          {notification.message}
        </div>
      )}

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <Brain size={22} className={styles.titleIcon} />
            <h1 className={styles.title}>AI Analysis Center</h1>
            {datasets.length > 0 && <span className={styles.badge}>{datasets.length} dataset{datasets.length > 1 ? 's' : ''}</span>}
          </div>
          <p className={styles.subtitle}>AI-powered insights, forecasting, and recommendations from your uploaded data</p>
        </div>
        <div className={styles.headerActions}>
          {/* Filters */}
          <div className={styles.filterWrap}>
            <Clock size={13} />
            <select className={styles.filterSelect} value={filters.time} onChange={e => setFilters(f => ({ ...f, time: e.target.value }))}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          {uniqueLocations.length > 0 && (
            <div className={styles.filterWrap}>
              <MapPin size={13} />
              <select className={styles.filterSelect} value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}>
                <option value="all">All Locations</option>
                {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}
          {uniqueColumns.length > 0 && (
            <div className={styles.filterWrap}>
              <BarChart3 size={13} />
              <select className={styles.filterSelect} value={filters.column} onChange={e => setFilters(f => ({ ...f, column: e.target.value }))}>
                <option value="all">All Columns</option>
                {uniqueColumns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <button className={styles.refreshBtn} onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? styles.spin : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className={styles.exportBtn} onClick={handleExport}>
            <FileDown size={14} /> Export
          </button>
        </div>
      </div>

      {/* ── No data state ── */}
      {noData && (
        <div className={styles.noData}>
          <Brain size={48} className={styles.noDataIcon} />
          <h3>No datasets loaded</h3>
          <p>Upload a dataset from the Analytics → User Data page to enable AI analysis.</p>
          <a href="/analytics/user-data" className={styles.noDataLink}>Go to User Data →</a>
        </div>
      )}

      {loading && (
        <div className={styles.loadingWrap}>
          <Loader2 size={32} className={styles.spin} />
          <span>Loading AI analysis...</span>
        </div>
      )}

      {!loading && datasets.length > 0 && (
        <>
          {/* ── Overall Analysis Summary (always shown at top of first page) ── */}
          {activeTab === 'insights' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2><BarChart3 size={18} /> Overall Analysis</h2>
                <span className={styles.timestamp}>
                  {filters.time !== 'all' ? filters.time : 'All time'}
                  {filters.location !== 'all' ? ` · ${filters.location}` : ''}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <div className={styles.summaryCard} style={{ borderTop: '3px solid #16a34a' }}>
                  <div className={styles.summaryVal} style={{ color: '#16a34a' }}>{overallGrowing}</div>
                  <div className={styles.summaryLbl}>Growing Metrics</div>
                </div>
                <div className={styles.summaryCard} style={{ borderTop: '3px solid #dc2626' }}>
                  <div className={styles.summaryVal} style={{ color: '#dc2626' }}>{overallDeclining}</div>
                  <div className={styles.summaryLbl}>Declining Metrics</div>
                </div>
                <div className={styles.summaryCard} style={{ borderTop: '3px solid #d97706' }}>
                  <div className={styles.summaryVal} style={{ color: '#d97706' }}>{overallWarnings}</div>
                  <div className={styles.summaryLbl}>Warnings</div>
                </div>
                <div className={styles.summaryCard} style={{ borderTop: '3px solid #2563eb' }}>
                  <div className={styles.summaryVal} style={{ color: '#2563eb' }}>{overallStable}</div>
                  <div className={styles.summaryLbl}>Stable Metrics</div>
                </div>
              </div>
              {/* Quick stats row */}
              <div className={styles.chartsRow}>
                <div className={styles.chartCard}>
                  <div className={styles.chartTitle}>Key Highlights</div>
                  <div className={styles.trendList}>
                    {bestCol && (
                      <div className={styles.trendItem}>
                        <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                          <ArrowUpRight size={14} style={{ display: 'inline' }} /> Best: {bestCol.name} ({pct(bestCol.score)})
                        </span>
                      </div>
                    )}
                    {worstCol && (
                      <div className={styles.trendItem}>
                        <span style={{ fontSize: '0.82rem', color: worstCol.score < 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                          {worstCol.score < 0 ? <ArrowDownLeft size={14} style={{ display: 'inline' }} /> : <ArrowUpRight size={14} style={{ display: 'inline' }} />} Worst: {worstCol.name} ({pct(worstCol.score)})
                        </span>
                      </div>
                    )}
                    <div className={styles.trendItem}>
                      <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600 }}>
                        <Activity size={14} style={{ display: 'inline' }} /> {totalAnomalies} Anomalies Detected
                      </span>
                    </div>
                    <div className={styles.trendItem}>
                      <span style={{ fontSize: '0.82rem', color: '#8b5cf6', fontWeight: 600 }}>
                        <Zap size={14} style={{ display: 'inline' }} /> {totalRecommendations} Recommendations
                      </span>
                    </div>
                    <div className={styles.trendItem}>
                      <span style={{ fontSize: '0.82rem', color: '#f97316', fontWeight: 600 }}>
                        <Globe2 size={14} style={{ display: 'inline' }} /> {totalRegions} Regions Analyzed
                      </span>
                    </div>
                    {topRegion && (
                      <div className={styles.trendItem}>
                        <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                          <MapPin size={14} style={{ display: 'inline' }} /> Top Region: {topRegion.region} (${fmt(topRegion.total)})
                        </span>
                      </div>
                    )}
                    {datasets[0] && (
                      <div className={styles.trendItem}>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                          <Brain size={14} style={{ display: 'inline' }} /> {datasets[0].fileName} · {datasets[0].rowCount} records · {datasets[0].numericColumns.length} metrics
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.chartCard}>
                  <div className={styles.chartTitle}>Metric Distribution</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Growing', value: overallGrowing || 1 },
                          { name: 'Declining', value: overallDeclining || 0 },
                          { name: 'Stable', value: overallStable || 0 },
                          { name: 'Warning', value: overallWarnings || 0 },
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={75}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        <Cell fill="#16a34a" />
                        <Cell fill="#dc2626" />
                        <Cell fill="#2563eb" />
                        <Cell fill="#d97706" />
                      </Pie>
                      <Tooltip {...ttip} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab Bar ── */}
          <div className={styles.tabBar}>
            {TABS.map(t => (
              <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`} onClick={() => setActiveTab(t.id)}>
                <t.icon size={15} strokeWidth={1.8} />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div className={styles.tabContent}>

            {/* ── INSIGHTS ── */}
            {activeTab === 'insights' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2><Lightbulb size={18} /> AI Insight Generator</h2>
                  <span className={styles.timestamp}>
                    Generated {new Date().toLocaleTimeString()}
                    {filters.location !== 'all' ? ` · Filtered: ${filters.location}` : ''}
                    {filters.time !== 'all' ? ` · ${filters.time}` : ''}
                  </span>
                </div>
                <div className={styles.insightGrid}>
                  {insights.map((ins, i) => (
                    <div key={i} className={`${styles.insightCard} ${styles['ins_' + ins.type]}`}>
                      <div className={styles.insightBullet}>
                        {ins.type === 'positive' && <ArrowUpRight size={16} />}
                        {ins.type === 'negative' && <ArrowDownLeft size={16} />}
                        {ins.type === 'warning' && <AlertTriangle size={16} />}
                        {ins.type === 'neutral' && <Activity size={16} />}
                      </div>
                      <div className={styles.insightBody}>
                        <span className={styles.insightText}>{ins.text}</span>
                        {ins.value && <span className={styles.insightValue}>{ins.value}</span>}
                      </div>
                    </div>
                  ))}
                  {insights.length === 0 && (
                    <div className={styles.emptyMsg} style={{ gridColumn: '1 / -1' }}>
                      <Info size={20} />
                      No insights available for the current filter selection.
                    </div>
                  )}
                </div>
                {/* Summary stats */}
                <div className={styles.summaryRow}>
                  {[
                    { label: 'Growing', val: overallGrowing, color: '#16a34a', bg: '#dcfce7' },
                    { label: 'Declining', val: overallDeclining, color: '#dc2626', bg: '#fee2e2' },
                    { label: 'Warnings', val: overallWarnings, color: '#d97706', bg: '#fef3c7' },
                    { label: 'Stable', val: overallStable, color: '#2563eb', bg: '#dbeafe' },
                  ].map(s => (
                    <div key={s.label} className={styles.summaryCard} style={{ borderTop: `3px solid ${s.color}` }}>
                      <div className={styles.summaryVal} style={{ color: s.color }}>{s.val}</div>
                      <div className={styles.summaryLbl}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TRENDS ── */}
            {activeTab === 'trends' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2><TrendingUp size={18} /> Trend Detection AI</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={styles.filterWrap}>
                      {CHART_TYPES.map(ct => (
                        <button
                          key={ct}
                          onClick={() => setTrendChartType(ct)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: 'none',
                            background: trendChartType === ct ? '#dcfce7' : 'transparent',
                            color: trendChartType === ct ? '#16a34a' : '#94a3b8',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: trendChartType === ct ? 600 : 400,
                            transition: 'all 0.15s',
                          }}
                        >
                        {ct === 'Area' && <Activity size={12} style={{ display: 'inline', marginRight: 2 }} />}
                        {ct === 'Bar' && <BarChart3 size={12} style={{ display: 'inline', marginRight: 2 }} />}
                        {ct === 'Line' && <TrendingUp size={12} style={{ display: 'inline', marginRight: 2 }} />}
                        {ct === 'Pie' && <Target size={12} style={{ display: 'inline', marginRight: 2 }} />}
                          {ct}
                        </button>
                      ))}
                    </div>
                    <span className={styles.timestamp}>
                      {activeCol || 'all columns'}
                      {filters.location !== 'all' ? ` · ${filters.location}` : ''}
                    </span>
                  </div>
                </div>
                <div className={styles.chartsRow}>
                  <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Trend {trendChartType !== 'Area' ? `(${trendChartType})` : ''} + Moving Average</div>
                    {trendChartType === 'Area' && (
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <Tooltip {...ttip} />
                          <Legend iconType="circle" iconSize={8} />
                          <Area type="monotone" dataKey="value" stroke="#16a34a" fill="url(#tg1)" strokeWidth={2} name="Value" />
                          <Line type="monotone" dataKey="ma" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" dot={false} name="MA(3)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                    {trendChartType === 'Bar' && (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <Tooltip {...ttip} />
                          <Legend iconType="circle" iconSize={8} />
                          <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} name="Value" />
                          <Bar dataKey="ma" fill="#2563eb" radius={[4, 4, 0, 0]} name="MA(3)" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {trendChartType === 'Line' && (
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <Tooltip {...ttip} />
                          <Legend iconType="circle" iconSize={8} />
                          <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} name="Value" />
                          <Line type="monotone" dataKey="ma" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" dot={false} name="MA(3)" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                    {trendChartType === 'Pie' && (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={trendData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
                            {trendData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip {...ttip} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Column Trends Overview</div>
                    <div className={styles.trendList}>
                      {(filters.location !== 'all' && datasets[0]?.locationAnalysis?.[filters.location]
                        ? Object.keys(datasets[0].locationAnalysis[filters.location])
                        : datasets[0]?.numericColumns || []
                      ).map(col => {
                        const a = getFilteredAnalysis(datasets[0] || {} as Dataset, col, filters.location, filters.time)
                        if (!a) return null
                        const up = a.trend === 'up'
                        const dn = a.trend === 'down'
                        return (
                          <div key={col} className={styles.trendItem}>
                            <div className={styles.trendName}>{col}</div>
                            <div className={styles.trendBar}>
                              <div className={styles.trendBarFill} style={{ width: `${Math.min(100, Math.abs(a.trendPercentage) * 2)}%`, background: up ? '#16a34a' : dn ? '#dc2626' : '#d97706' }} />
                            </div>
                            <span className={styles.trendPct} style={{ color: up ? '#16a34a' : dn ? '#dc2626' : '#d97706' }}>
                              {up ? <TrendingUp size={12} /> : dn ? <TrendingDown size={12} /> : <Activity size={12} />}
                              {pct(a.trendPercentage)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── FORECAST ── */}
            {activeTab === 'forecast' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2><Target size={18} /> Forecasting Engine</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={styles.filterWrap}>
                      {CHART_TYPES.filter(ct => ct !== 'Pie').map(ct => (
                        <button
                          key={ct}
                          onClick={() => setForecastChartType(ct)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: 'none',
                            background: forecastChartType === ct ? '#dcfce7' : 'transparent',
                            color: forecastChartType === ct ? '#16a34a' : '#94a3b8',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: forecastChartType === ct ? 600 : 400,
                            transition: 'all 0.15s',
                          }}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                    <div className={styles.confidenceBadge}>
                      {trendAnalysis?.linearRegression.r2
                        ? `${Math.round(trendAnalysis.linearRegression.r2 * 100)}% confidence`
                        : 'Calculating...'}
                    </div>
                  </div>
                </div>
                <div className={styles.chartsRow}>
                  <div className={styles.chartCard} style={{ flex: 2 }}>
                    <div className={styles.chartTitle}>Revenue Forecast — Next 6 Periods {forecastChartType !== 'Area' ? `(${forecastChartType})` : ''}</div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>Solid = actual · Dashed = AI forecast</p>
                    {forecastChartType === 'Area' && (
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={forecastData}>
                          <defs>
                            <linearGradient id="fg1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <Tooltip {...ttip} />
                          <Legend iconType="circle" iconSize={8} />
                          <Area type="monotone" dataKey="actual" stroke="#16a34a" fill="url(#fg1)" strokeWidth={2} name="Actual" connectNulls={false} />
                          <Area type="monotone" dataKey="forecast" stroke="#f97316" fill="url(#fg2)" strokeWidth={2} strokeDasharray="6 3" name="Forecast" connectNulls={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                    {forecastChartType === 'Bar' && (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={forecastData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <Tooltip {...ttip} />
                          <Legend iconType="circle" iconSize={8} />
                          <Bar dataKey="actual" fill="#16a34a" radius={[4, 4, 0, 0]} name="Actual" />
                          <Bar dataKey="forecast" fill="#f97316" radius={[4, 4, 0, 0]} name="Forecast" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {forecastChartType === 'Line' && (
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={forecastData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                          <Tooltip {...ttip} />
                          <Legend iconType="circle" iconSize={8} />
                          <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} dot={true} name="Actual" />
                          <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" dot={true} name="Forecast" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Forecast Summary</div>
                    {trendAnalysis && (() => {
                      const a = trendAnalysis
                      const periods = [
                        { label: 'Next Week', val: a.forecast[0] },
                        { label: 'Next Month', val: a.forecast[1] },
                        { label: 'Next Quarter', val: a.forecast[3] },
                        { label: 'Next Year', val: a.forecast[4] },
                      ]
                      return (
                        <div className={styles.forecastList}>
                          {periods.map(p => p.val != null && (
                            <div key={p.label} className={styles.forecastItem}>
                              <span className={styles.forecastLabel}>{p.label}</span>
                              <span className={styles.forecastVal}>{fmt(p.val)}</span>
                              <span className={styles.forecastChange} style={{ color: p.val > a.mean ? '#16a34a' : '#dc2626' }}>
                                {p.val > a.mean ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                {pct(((p.val - a.mean) / Math.abs(a.mean)) * 100)}
                              </span>
                            </div>
                          ))}
                          <div className={styles.forecastMetaRow}>
                            <span>CGR</span><span style={{ color: a.compoundGrowthRate >= 0 ? '#16a34a' : '#dc2626' }}>{pct(a.compoundGrowthRate)}</span>
                          </div>
                          <div className={styles.forecastMetaRow}>
                            <span>R² (confidence)</span><span>{a.linearRegression.r2.toFixed(3)}</span>
                          </div>
                          <div className={styles.forecastMetaRow}>
                            <span>Slope</span><span>{a.linearRegression.slope.toFixed(4)}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* ── RECOMMENDATIONS ── */}
            {activeTab === 'recommendations' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2><Zap size={18} /> Smart Recommendation Engine</h2>
                  <span className={styles.timestamp}>
                    {recommendations.length} actionable recommendations
                    {filters.location !== 'all' ? ` · ${filters.location}` : ''}
                  </span>
                </div>
                <div className={styles.recGrid}>
                  {recommendations.map((r, i) => {
                    const p = { High: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' }, Medium: { bg: '#fef3c7', color: '#d97706', border: '#fde68a' }, Low: { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' } }[r.priority]
                    return (
                      <div key={i} className={styles.recCard}>
                        <div className={styles.recHeader}>
                          <h3 className={styles.recTitle}>{r.title}</h3>
                          <span className={styles.recPriority} style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>{r.priority}</span>
                        </div>
                        <p className={styles.recDesc}>{r.desc}</p>
                        <div className={styles.recImpact}><CheckCircle2 size={13} /> Impact: {r.impact}</div>
                        <button
                          className={styles.recBtn}
                          onClick={() => showNotification(`Action initiated: ${r.title}`, 'success')}
                        >
                          Take Action <ChevronRight size={13} />
                        </button>
                      </div>
                    )
                  })}
                  {recommendations.length === 0 && <div className={styles.emptyMsg}>No recommendations yet. Upload more data for AI-powered suggestions.</div>}
                </div>
              </div>
            )}

            {/* ── ANOMALIES ── */}
            {activeTab === 'anomalies' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2><AlertTriangle size={18} /> Anomaly Detection System</h2>
                  <span className={styles.timestamp}>
                    {anomalies.filter(a => a.severity === 'High').length} critical alerts
                    {filters.time !== 'all' ? ` · ${filters.time}` : ''}
                  </span>
                </div>
                <div className={styles.anomalyList}>
                  {anomalies.map((a, i) => {
                    const s = { High: { color: '#dc2626', bg: '#fee2e2', icon: '🔴' }, Medium: { color: '#d97706', bg: '#fef3c7', icon: '🟡' }, Low: { color: '#16a34a', bg: '#dcfce7', icon: '🟢' } }[a.severity]
                    return (
                      <div key={i} className={styles.anomalyCard} style={{ borderLeft: `4px solid ${s.color}` }}>
                        <span className={styles.anomalySev} style={{ background: s.bg, color: s.color }}>{s.icon} {a.severity}</span>
                        <div className={styles.anomalyBody}>
                          <div className={styles.anomalyTitle}>{a.description}</div>
                          <div className={styles.anomalyMeta}><strong>{a.column}</strong> · Value: {a.value} · At: {a.time}</div>
                        </div>
                        <AlertTriangle size={16} style={{ color: s.color, flexShrink: 0 }} />
                      </div>
                    )
                  })}
                  {anomalies.length === 0 && <div className={styles.emptyMsg}><CheckCircle2 size={20} style={{ color: '#16a34a' }} /> No anomalies detected in the current dataset.</div>}
                </div>
              </div>
            )}

            {/* ── REGIONAL ── */}
            {activeTab === 'regional' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2><Globe2 size={18} /> Regional Performance Intelligence</h2>
                  <span className={styles.timestamp}>{regionStats.length} regions analyzed</span>
                </div>
                {regionStats.length === 0
                  ? <div className={styles.emptyMsg}><Info size={20} /> No location data detected. Ensure your dataset has a column named "location", "region", "city", "state", or similar.</div>
                  : (
                    <div className={styles.chartsRow}>
                      <div className={styles.chartCard} style={{ flex: 2 }}>
                        <div className={styles.chartTitle}>Revenue by Region</div>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={regionStats} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                            <YAxis dataKey="region" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={70} {...axis} />
                            <Tooltip {...ttip} formatter={(v: number) => fmt(v)} />
                            <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={22} name="Total">
                              {regionStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className={styles.chartCard}>
                        <div className={styles.chartTitle}>Region Rankings</div>
                        <div className={styles.regionRankList}>
                          {regionStats.map((r, i) => (
                            <div key={r.region} className={styles.rankItem}>
                              <span className={styles.rankNum} style={{ background: i === 0 ? '#dcfce7' : i === 1 ? '#dbeafe' : 'var(--bg-2)', color: i === 0 ? '#16a34a' : i === 1 ? '#2563eb' : 'var(--text-muted)' }}>#{i + 1}</span>
                              <span className={styles.rankName}>{r.region}</span>
                              <span className={styles.rankVal}>{fmt(r.total)}</span>
                              <span className={styles.rankGrowth} style={{ color: r.growth >= 0 ? '#16a34a' : '#dc2626' }}>
                                {r.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                {pct(r.growth)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* ── CHAT ── */}
            {activeTab === 'chat' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2><MessageSquare size={18} /> AI Business Assistant</h2>
                  <span className={styles.timestamp}>
                    Powered by your dataset
                    {filters.location !== 'all' ? ` · Focus: ${filters.location}` : ''}
                  </span>
                </div>
                <div className={styles.chatSuggestions}>
                  {['Why did sales decrease?','Which location has highest profit?','Predict next quarter revenue','Which column should I focus on?','Show top performing region'].map(q => (
                    <button key={q} className={styles.suggestionBtn} onClick={() => handleSuggestion(q)}>{q}</button>
                  ))}
                </div>
                <div className={styles.chatWindow}>
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`${styles.chatMsg} ${m.role === 'user' ? styles.chatUser : styles.chatAI}`}>
                      {m.role === 'ai' && <div className={styles.chatAIIcon}><Brain size={14} /></div>}
                      <div className={styles.chatBubble}>
                        <div className={styles.chatText}>{m.text}</div>
                        <div className={styles.chatTime}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className={`${styles.chatMsg} ${styles.chatAI}`}>
                      <div className={styles.chatAIIcon}><Brain size={14} /></div>
                      <div className={styles.chatBubble}><div className={styles.chatTyping}><span /><span /><span /></div></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className={styles.chatInputRow}>
                  <input
                    className={styles.chatInput}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                    placeholder="Ask anything about your data..."
                  />
                  <button className={styles.chatSendBtn} onClick={() => sendChat()} disabled={!chatInput.trim() || chatLoading}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  )
}