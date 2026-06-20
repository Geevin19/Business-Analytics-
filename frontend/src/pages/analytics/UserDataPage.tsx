import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Upload, FileText, Database, TrendingUp, TrendingDown,
  Activity, BarChart3, Trash2, Table, AlertCircle,
  FileSpreadsheet, FileJson, Clock
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import PageShell from '@/components/ui/PageShell'
import api from '@/services/api'
import styles from './UserDataPage.module.css'

/* ── Types ── */
interface TrendResult {
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

interface UploadedDataset {
  id: string
  fileName: string
  fileType: string
  uploadedAt: string
  rowCount: number
  columnNames: string[]
  numericColumns: string[]
  analysis: Record<string, TrendResult>
  rawPreview: Record<string, any>[]
  schedule?: string
  lastScheduledUpdate?: string
}

/* ── Helpers ── */
function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getFileIcon(type: string) {
  if (type === 'csv') return <FileSpreadsheet size={18} />
  if (type === 'json') return <FileJson size={18} />
  return <FileText size={18} />
}

/* ── Component ── */
export default function UserDataPage() {
  const [searchParams] = useSearchParams()
  const [datasets, setDatasets] = useState<UploadedDataset[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pasteContent, setPasteContent] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [schedule, setSchedule] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none')
  const [appendMode, setAppendMode] = useState(false)
  const [appendTargetId, setAppendTargetId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load datasets
  const loadDatasets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/trend/datasets')
      setDatasets(res.data)
    } catch (err) {
      console.error('Failed to load datasets', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDatasets() }, [loadDatasets])

  // Auto-select dataset from URL query param
  useEffect(() => {
    const datasetName = searchParams.get('dataset')
    if (datasetName && datasets.length > 0) {
      const match = datasets.find(d => d.fileName === datasetName)
      if (match && match.id !== selectedId) {
        setSelectedId(match.id)
        setSelectedColumn(match.numericColumns[0] || null)
      }
    }
  }, [searchParams, datasets, selectedId])

  const selectedDataset = datasets.find(d => d.id === selectedId)
  const activeColumn = selectedColumn || selectedDataset?.numericColumns[0] || null
  const activeAnalysis = activeColumn && selectedDataset?.analysis[activeColumn] || null

  const notifyDatasetsChanged = () => {
    window.dispatchEvent(new CustomEvent('datasets-changed'))
  }

  // ── Upload handlers ──
  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const params: any = {}
      if (schedule !== 'none') params.schedule = schedule

      const res = await api.post('/trend/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params,
      })
      setDatasets(prev => [res.data, ...prev])
      setSelectedId(res.data.id)
      setSelectedColumn(res.data.numericColumns[0] || null)
      notifyDatasetsChanged()
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const handlePasteUpload = async () => {
    if (!pasteContent.trim()) return

    try {
      setUploading(true)
      const isJson = pasteContent.trim().startsWith('[') || pasteContent.trim().startsWith('{')
      const type = isJson ? 'json' : 'csv'

      // Append mode: send to append endpoint
      if (appendMode && appendTargetId) {
        const res = await api.post(`/trend/datasets/${appendTargetId}/append`, {
          content: pasteContent,
          fileType: type,
        })
        // Update the dataset in the list
        setDatasets(prev => prev.map(d => d.id === res.data.id ? res.data : d))
        setSelectedId(res.data.id)
        notifyDatasetsChanged()
      } else {
        const res = await api.post('/trend/upload-data', {
          content: pasteContent,
          fileName: `pasted_${Date.now()}.${type}`,
          fileType: type,
          schedule: schedule !== 'none' ? schedule : undefined,
        })
        setDatasets(prev => [res.data, ...prev])
        setSelectedId(res.data.id)
        setSelectedColumn(res.data.numericColumns[0] || null)
        notifyDatasetsChanged()
      }
      setPasteContent('')
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.delete(`/trend/datasets/${id}`)
      setDatasets(prev => prev.filter(d => d.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setSelectedColumn(null)
      }
      notifyDatasetsChanged()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const handleClearAll = async () => {
    try {
      await api.delete('/trend/datasets')
      setDatasets([])
      setSelectedId(null)
      setSelectedColumn(null)
      notifyDatasetsChanged()
    } catch (err) {
      console.error('Clear failed', err)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleUpdateSchedule = async (dsId: string, newSchedule: string) => {
    try {
      const res = await api.put(`/trend/datasets/${dsId}/schedule`, { schedule: newSchedule })
      setDatasets(prev => prev.map(d => d.id === res.data.id ? res.data : d))
    } catch (err) {
      console.error('Failed to update schedule', err)
    }
  }

  // ── Chart data builders ──
  function buildTrendChartData(analysis: TrendResult) {
    return analysis.rawData.map((v, i) => ({
      label: analysis.labels[i] || `#${i + 1}`,
      value: v,
      movingAvg: analysis.movingAverage?.[i] ?? null,
    }))
  }

  function buildForecastChartData(analysis: TrendResult) {
    const current = analysis.rawData.map((v, i) => ({
      label: analysis.labels[i] || `#${i + 1}`,
      actual: v,
      forecast: null as number | null,
    }))
    const future = analysis.forecast.map((v, i) => ({
      label: `F${i + 1}`,
      actual: null as number | null,
      forecast: v,
    }))
    return [...current, ...future]
  }

  function buildGrowthChartData(analysis: TrendResult) {
    return analysis.growthRate.map((v, i) => ({
      label: `\u0394${i + 2}`,
      rate: v,
    }))
  }

  const chartTooltip = {
    contentStyle: { borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 } as React.CSSProperties,
  }

  return (
    <PageShell
      title="Data Trend Analyzer"
      subtitle="Upload any data file - CSV, JSON, TXT - and get mathematical trend analysis with visuals"
    >
      {/* ── Upload + Datasets Grid ── */}
      <div className={styles.mainGrid}>
        {/* Left: Upload Panel */}
        <div className={styles.uploadCard}>
          <h3>Upload Your Data</h3>

          {/* ── Schedule Selection ── */}
          <div className={styles.scheduleRow}>
            <span className={styles.scheduleLabel}>Schedule:</span>
            {(['none', 'daily', 'weekly', 'monthly', 'yearly'] as const).map(s => (
              <button
                key={s}
                className={`${styles.scheduleBtn} ${schedule === s ? styles.active : ''}`}
                onClick={() => setSchedule(s)}
                type="button"
              >
                {s === 'none' ? 'No Schedule' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {schedule !== 'none' && (
            <div className={styles.scheduleHint}>
              <Clock size={12} /> Data will accumulate over time. Each upload appends to this dataset for continuous trend analysis.
            </div>
          )}

          {/* ── Append Mode Toggle ── */}
          {datasets.length > 0 && (
            <div className={styles.appendRow}>
              <label className={styles.appendToggle}>
                <input
                  type="checkbox"
                  checked={appendMode}
                  onChange={() => setAppendMode(!appendMode)}
                />
                <span>Append to existing dataset</span>
              </label>
              {appendMode && (
                <select
                  className={styles.appendSelect}
                  value={appendTargetId || ''}
                  onChange={(e) => setAppendTargetId(e.target.value || null)}
                >
                  <option value="">Select dataset...</option>
                  {datasets.map(ds => (
                    <option key={ds.id} value={ds.id}>
                      {ds.fileName} ({ds.rowCount} rows{ds.schedule && ds.schedule !== 'none' ? `, ${ds.schedule}` : ''})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`${styles.dropZone} ${dragOver ? styles.dragging : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.dropIcon}><Upload size={36} strokeWidth={1.5} /></div>
            <div className={styles.dropText}>Drop your file here or click to browse</div>
            <div className={styles.dropHint}>Supports CSV, JSON, TXT, TSV, Excel (.xlsx, .xls) - up to 10MB</div>
            <input
              ref={fileInputRef}
              type="file"
              className={styles.fileInput}
              accept=".csv,.json,.txt,.tsv,.tab,.xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
                e.target.value = ''
              }}
            />
          </div>

          <div className={styles.divider}>or paste your data</div>

          {/* Paste area */}
          <textarea
            className={styles.pasteArea}
            placeholder={'Paste your data here...\n\nCSV example:\nmonth,revenue,expenses\nJan,42000,28000\nFeb,48000,30000\n\nJSON example:\n[{"month":"Jan","value":100},{"month":"Feb","value":150}]'}
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            rows={6}
          />
          <div className={styles.uploadRow}>
            <button
              className={styles.uploadBtn}
              onClick={handlePasteUpload}
              disabled={!pasteContent.trim() || uploading}
            >
              {uploading ? <><div className={styles.spinner} style={{ width: 16, height: 16 }} /> Analyzing...</>
                : <><Upload size={16} /> {appendMode && appendTargetId ? 'Append Data' : 'Analyze Data'}</>}
            </button>
          </div>
        </div>

        {/* Right: Datasets List */}
        <div className={styles.datasetsCard}>
          <div className={styles.datasetsHeader}>
            <h3>Uploaded Datasets ({datasets.length})</h3>
            {datasets.length > 0 && (
              <button className={styles.clearBtn} onClick={handleClearAll}>
                <Trash2 size={13} /> Clear All
              </button>
            )}
          </div>

          <div className={styles.datasetList}>
            {loading && datasets.length === 0 && (
              <div className={styles.loadingOverlay}>
                <div className={styles.spinner} />
              </div>
            )}

            {!loading && datasets.length === 0 && (
              <div className={styles.emptyState}>
                <Database size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>No datasets uploaded yet</p>
                <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Upload a file or paste data to analyze trends</p>
              </div>
            )}

            {datasets.map(ds => (
              <div
                key={ds.id}
                className={`${styles.datasetItem} ${selectedId === ds.id ? styles.active : ''}`}
                onClick={() => {
                  setSelectedId(ds.id)
                  setSelectedColumn(ds.numericColumns[0] || null)
                }}
              >
                <div className={styles.datasetIcon}>
                  {getFileIcon(ds.fileType)}
                </div>
                <div className={styles.datasetInfo}>
                  <div className={styles.datasetName}>
                    {ds.fileName}
                    {ds.schedule && ds.schedule !== 'none' && (
                      <span className={styles.datasetSchedule}>{ds.schedule}</span>
                    )}
                  </div>
                  <div className={styles.datasetMeta}>
                    {ds.rowCount} rows - {ds.numericColumns.length} numeric cols - {formatDate(ds.uploadedAt)}
                    {ds.lastScheduledUpdate && ` · Updated: ${formatDate(ds.lastScheduledUpdate)}`}
                  </div>
                </div>
                <div className={styles.datasetActions}>
                  <button className={styles.deleteBtn} onClick={(e) => handleDelete(ds.id, e)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Analysis Section ── */}
      {selectedDataset && activeAnalysis ? (
        <div className={styles.analysisSection}>
          <div className={styles.analysisHeader}>
            <h3>
              Trend Analysis:
              <span style={{ fontWeight: 400, marginLeft: 6, color: 'var(--text-muted)' }}>
                {selectedDataset.fileName} / {activeColumn}
              </span>
            </h3>
            <div className={styles.columnSelector}>
              {selectedDataset.numericColumns.map(col => (
                <button
                  key={col}
                  className={`${styles.columnBadge} ${activeColumn === col ? styles.active : ''}`}
                  onClick={() => setSelectedColumn(col)}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Info */}
          {selectedDataset.schedule && selectedDataset.schedule !== 'none' && (
            <div className={styles.scheduleInfoRow}>
              <Clock size={13} />
              <span>Scheduled: <strong>{selectedDataset.schedule}</strong> — Data accumulates for longer trend analysis</span>
              {selectedDataset.lastScheduledUpdate && (
                <span className={styles.scheduleLastUpdate}>
                  Last update: {formatDate(selectedDataset.lastScheduledUpdate)}
                </span>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Mean</div>
              <div className={styles.statValue}>{formatNumber(activeAnalysis.mean)}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Median</div>
              <div className={styles.statValue}>{formatNumber(activeAnalysis.median)}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Std Deviation</div>
              <div className={styles.statValue}>{formatNumber(activeAnalysis.stdDev)}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Variance</div>
              <div className={styles.statValue}>{formatNumber(activeAnalysis.variance)}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Min</div>
              <div className={styles.statValue}>{formatNumber(activeAnalysis.min)}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Max</div>
              <div className={styles.statValue}>{formatNumber(activeAnalysis.max)}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Range</div>
              <div className={styles.statValue}>{formatNumber(activeAnalysis.range)}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>
                Trend
                {activeAnalysis.trend === 'up' && <TrendingUp size={14} style={{ marginLeft: 4, color: '#16a34a' }} />}
                {activeAnalysis.trend === 'down' && <TrendingDown size={14} style={{ marginLeft: 4, color: '#dc2626' }} />}
                {activeAnalysis.trend === 'stable' && <Activity size={14} style={{ marginLeft: 4, color: '#d97706' }} />}
              </div>
              <div className={`${styles.statValue} ${
                activeAnalysis.trend === 'up' ? styles.trendUp :
                activeAnalysis.trend === 'down' ? styles.trendDown : styles.trendStable
              }`}>
                {activeAnalysis.trendPercentage > 0 ? '+' : ''}{activeAnalysis.trendPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className={styles.chartContainer}>
            <div className={styles.chartTitle}>
              <BarChart3 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Data Trend with Moving Average
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={buildTrendChartData(activeAnalysis)}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} />
                <Legend iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="value" stroke="#16a34a" fill="url(#trendGrad)" strokeWidth={2} name="Data" />
                <Area type="monotone" dataKey="movingAvg" stroke="#2563eb" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Moving Avg (3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Chart */}
          <div className={styles.chartContainer}>
            <div className={styles.chartTitle}>
              <BarChart3 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Forecast (Next {activeAnalysis.forecast.length} Periods) - Linear Regression
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={buildForecastChartData(activeAnalysis)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} dot={{ r: 2 }} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#f97316' }} name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Rate Chart */}
          {activeAnalysis.growthRate.length > 0 && (
            <div className={styles.chartContainer}>
              <div className={styles.chartTitle}>
                <BarChart3 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Period-over-Period Growth Rate (%)
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={buildGrowthChartData(activeAnalysis)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltip} formatter={(v: number) => `${v.toFixed(2)}%` as any} />
                  <Bar dataKey="rate" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={24} name="Growth Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Regression & Growth Info */}
          <div className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxLabel}>R2 (Goodness of Fit)</div>
              <div className={styles.infoBoxValue}>{activeAnalysis.linearRegression.r2.toFixed(4)}</div>
              <div className={styles.statHint}>Formula: R² = 1 - SS_res/SS_tot</div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxLabel}>Slope</div>
              <div className={styles.infoBoxValue}>{formatNumber(activeAnalysis.linearRegression.slope)}</div>
              <div className={styles.statHint}>m = (nΣxy - ΣxΣy)/(nΣx² - (Σx)²)</div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxLabel}>Intercept</div>
              <div className={styles.infoBoxValue}>{formatNumber(activeAnalysis.linearRegression.intercept)}</div>
              <div className={styles.statHint}>b = ȳ - m·x̄</div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxLabel}>Compound Growth Rate</div>
              <div className={styles.infoBoxValue}>{activeAnalysis.compoundGrowthRate.toFixed(2)}%</div>
              <div className={styles.statHint}>CGR = ((Vₙ/V₀)^(1/(n-1)) - 1) × 100</div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxLabel}>Mode</div>
              <div className={styles.infoBoxValue}>
                {activeAnalysis.mode.length > 0 ? activeAnalysis.mode.map(m => formatNumber(m)).join(', ') : 'N/A'}
              </div>
              <div className={styles.statHint}>Most frequent value(s)</div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxLabel}>Seasonal Index</div>
              <div className={styles.infoBoxValue}>
                {activeAnalysis.seasonalIndex.length > 0
                  ? activeAnalysis.seasonalIndex.map(s => s.toFixed(1) + '%').join(', ')
                  : 'Need ≥ 8 periods'}
              </div>
              <div className={styles.statHint}>Sᵢ = (avg of period / overall mean) × 100</div>
            </div>
          </div>

          {/* Data Preview */}
          <div className={styles.previewSection}>
            <div className={styles.chartTitle}>
              <Table size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Data Preview (first {Math.min(selectedDataset.rawPreview.length, 10)} of {selectedDataset.rowCount} rows)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    {selectedDataset.columnNames.map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedDataset.rawPreview.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {selectedDataset.columnNames.map(col => (
                        <td key={col}>{String(row[col] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedDataset && !activeAnalysis ? (
        <div className={styles.analysisSection}>
          <div className={styles.noSelection}>
            <AlertCircle size={36} className={styles.noSelectionIcon} />
            <div className={styles.noSelectionText}>No numeric columns found</div>
            <div className={styles.noSelectionHint}>This dataset contains no analyzable numeric data</div>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}