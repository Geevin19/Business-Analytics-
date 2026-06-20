import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Download, FileText, CheckSquare, Square, BarChart3,
  Table2, Sigma, Settings, Eye, FileDown,
  CheckCircle, Loader2, RefreshCw, Search,
  ChevronDown, ChevronUp, Layout, Palette, Maximize,
  ArrowUpRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import styles from './ReportsPage.module.css'
import {
  generateReport,
  exportPDF,
  exportExcel,
  exportCSV,
  exportHTML,
  type ReportContent,
  type ReportSection,
  type ReportOptions,
  REPORT_COLORS,
  COMPANY_DEFAULTS,
  FORMULA_LABELS,
  formatNumber,
  getTimestamp
} from '@/services/report.service'

/* ── Types for data sources ── */
interface DashboardKPI {
  label: string
  value: string
  change?: string
  down?: boolean
  trendColor?: 'up' | 'down' | 'stable'
}

interface DataRow {
  [key: string]: any
}

interface DataSource {
  id: string
  name: string
  type: 'analyzed_columns' | 'sales' | 'customers' | 'inventory' | 'forecast' | 'trends'
  kpis: DashboardKPI[]
  headers: string[]
  rows: string[][]
  formulas?: { label: string; formula: string }[]
}

const PERIODS = ['All Time', 'Today', 'Week', 'Month', 'Year'] as const
const FORMATS = ['pdf', 'xlsx', 'csv', 'html'] as const
const COLOR_SCHEMES = ['professional', 'modern', 'minimal'] as const
const PAGE_SIZES = ['A4', 'Letter'] as const

export default function ReportsPage() {
  const { user, profile } = useAuth()
  
  // ── State ──
  const [period, setPeriod] = useState<string>('All Time')
  const [searchQuery, setSearchQuery] = useState('')
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Section toggles
  const [includeKpis, setIncludeKpis] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeTables, setIncludeTables] = useState(true)
  const [includeFormulas, setIncludeFormulas] = useState(true)
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'xlsx' | 'csv' | 'html'>('pdf')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [colorScheme, setColorScheme] = useState<'professional' | 'modern' | 'minimal'>('professional')
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4')

  // ── Load data from all sources ──
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const sources: DataSource[] = []

      // 1. Analyzed columns from trend service
      const analyzedRes = await api.get('/trend/analyzed-columns').catch(() => ({ data: [] }))
      if (analyzedRes.data.length > 0) {
        const kpis: DashboardKPI[] = analyzedRes.data.slice(0, 12).map((c: any) => ({
          label: c.columnName,
          value: formatNumber(c.mean),
          change: `${c.trendPercentage > 0 ? '+' : ''}${c.trendPercentage.toFixed(1)}%`,
          trendColor: c.trend as 'up' | 'down' | 'stable',
          down: c.trend === 'down',
        }))
        sources.push({
          id: 'analyzed',
          name: 'Data Analysis',
          type: 'analyzed_columns',
          kpis,
          headers: ['Column', 'Mean', 'Min', 'Max', 'Trend'],
          rows: analyzedRes.data.slice(0, 20).map((c: any) => [
            c.columnName,
            formatNumber(c.mean),
            formatNumber(c.min),
            formatNumber(c.max),
            `${c.trendPercentage > 0 ? '+' : ''}${c.trendPercentage.toFixed(1)}%`,
          ]),
          formulas: [
            { label: 'Mean (μ)', formula: 'μ = (1/n) × Σxᵢ' },
            { label: 'Trend %', formula: '((last - first) / |first|) × 100' },
            { label: 'R² Fit', formula: 'R² = 1 - (SS_res / SS_tot)' },
            { label: 'CGR', formula: '((V_final / V_initial)^(1/(n-1)) - 1) × 100' },
            { label: 'Std Dev (σ)', formula: 'σ = √( (1/n) × Σ(xᵢ - μ)² )' },
          ],
        })
      }

      // 2. Sales data
      const salesRes = await api.get('/sales/all').catch(() => ({ data: [] }))
      if (Array.isArray(salesRes.data) && salesRes.data.length > 0) {
        const totalRevenue = salesRes.data.reduce((s: number, r: any) => s + Number(r.total || 0), 0)
        const avgOrder = totalRevenue / salesRes.data.length
        const activeCustomers = new Set(salesRes.data.map((r: any) => r.customer_id)).size
        sources.push({
          id: 'sales',
          name: 'Sales Analytics',
          type: 'sales',
          kpis: [
            { label: 'Total Revenue', value: `$${formatNumber(totalRevenue)}` },
            { label: 'Total Orders', value: String(salesRes.data.length) },
            { label: 'Avg Order Value', value: `$${formatNumber(avgOrder)}` },
            { label: 'Active Customers', value: String(activeCustomers) },
          ],
          headers: ['Date', 'Customer', 'Total', 'Status'],
          rows: salesRes.data.slice(0, 15).map((r: any) => [
            r.sale_date ? new Date(r.sale_date).toLocaleDateString() : '-',
            r.customers?.name || 'Unknown',
            `$${formatNumber(Number(r.total) || 0)}`,
            'Completed',
          ]),
        })
      }

      // 3. Customers data
      const customersRes = await api.get('/customers').catch(() => ({ data: [] }))
      if (Array.isArray(customersRes.data) && customersRes.data.length > 0) {
        const new30d = customersRes.data.filter((c: any) => {
          const d = c.created_at ? new Date(c.created_at) : c.registration_date ? new Date(c.registration_date) : null
          return d && (Date.now() - d.getTime()) < 30 * 86400000
        }).length
        const totalRevenue = customersRes.data.reduce((s: number, c: any) => s + Number(c.total_spent || c.revenue || 0), 0)
        sources.push({
          id: 'customers',
          name: 'Customer Analytics',
          type: 'customers',
          kpis: [
            { label: 'Total Customers', value: String(customersRes.data.length) },
            { label: 'New (30d)', value: String(new30d) },
            { label: 'Total Revenue', value: `$${formatNumber(totalRevenue)}` },
          ],
          headers: ['Name', 'Email', 'Total Spent', 'Status'],
          rows: customersRes.data.slice(0, 15).map((c: any) => [
            c.name || c.first_name + ' ' + c.last_name || 'Unknown',
            c.email || '-',
            `$${formatNumber(Number(c.total_spent || c.revenue || 0))}`,
            c.status || 'Active',
          ]),
        })
      }

      // 4. Inventory data
      const inventoryRes = await api.get('/inventory').catch(() => ({ data: [] }))
      if (Array.isArray(inventoryRes.data) && inventoryRes.data.length > 0) {
        const lowStock = inventoryRes.data.filter((i: any) => Number(i.quantity || i.stock_level || 0) < 10)
        const totalValue = inventoryRes.data.reduce((s: number, i: any) => s + Number(i.price || i.unit_price || 0) * Number(i.quantity || i.stock_level || 0), 0)
        sources.push({
          id: 'inventory',
          name: 'Inventory Status',
          type: 'inventory',
          kpis: [
            { label: 'Total Products', value: String(inventoryRes.data.length) },
            { label: 'Low Stock Items', value: String(lowStock.length), trendColor: lowStock.length > 0 ? 'down' : 'up', down: lowStock.length > 0 },
            { label: 'Total Value', value: `$${formatNumber(totalValue)}` },
          ],
          headers: ['Product', 'Quantity', 'Price', 'Category'],
          rows: inventoryRes.data.slice(0, 15).map((i: any) => [
            i.name || i.product_name || 'Unknown',
            String(i.quantity || i.stock_level || 0),
            `$${formatNumber(Number(i.price || i.unit_price || 0))}`,
            i.category || '-',
          ]),
        })
      }

      setDataSources(sources)
    } catch (err) {
      console.error('Failed to load report data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Filtered sources by search ──
  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return dataSources
    const q = searchQuery.toLowerCase()
    return dataSources.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.kpis.some(k => k.label.toLowerCase().includes(q)) ||
      s.rows.some(r => r.some(c => c.toLowerCase().includes(q)))
    )
  }, [dataSources, searchQuery])

  // ── Build report content ──
  const reportContent = useMemo<ReportContent>(() => {
    const sections: ReportSection[] = []

    // Overview section
    sections.push({
      title: 'Executive Summary',
      type: 'text',
      description: 'High-level overview of key business metrics',
      content: `This report provides a comprehensive analysis of business performance across ${filteredSources.length} data dimensions. Generated on ${getTimestamp()} for period: ${period}. The report covers data analysis, sales performance, customer insights, and inventory status.`,
    })

    // KPI sections
    filteredSources.forEach(source => {
      if (includeKpis && source.kpis.length > 0) {
        sections.push({
          title: `${source.name} — Key Metrics`,
          type: 'kpi',
          description: `Performance indicators for ${source.name.toLowerCase()}`,
          content: source.kpis.map(k => ({
            ...k,
            change: k.change || '-',
          })),
        })
      }

      // Table sections
      if (includeTables && source.rows.length > 0) {
        sections.push({
          title: `${source.name} — Data Table`,
          type: 'table',
          description: `Raw data (${source.rows.length} rows)`,
          content: {
            headers: source.headers,
            rows: source.rows,
          },
        })
      }

      // Formula sections
      if (includeFormulas && source.formulas && source.formulas.length > 0) {
        sections.push({
          title: `${source.name} — Formulas Used`,
          type: 'formula',
          description: 'Statistical and analytical formulas applied',
          content: source.formulas,
        })
      }
    })

    // Complete formula reference
    if (includeFormulas) {
      sections.push({
        title: 'Complete Formula Reference',
        type: 'formula',
        description: 'All statistical formulas used in data analysis',
        content: Object.entries(FORMULA_LABELS).map(([key, formula]) => ({
          label: key,
          formula,
        })),
      })
    }

    const companyName = profile?.name 
      ? `${profile.name} — ${COMPANY_DEFAULTS.name}`
      : COMPANY_DEFAULTS.name

    return {
      companyName,
      reportTitle: `Business Analytics Report — ${period}`,
      reportSubtitle: `Comprehensive analysis across ${filteredSources.length} data sources`,
      generatedAt: getTimestamp(),
      generatedBy: profile?.name || user?.email || 'System',
      period,
      sections,
    }
  }, [filteredSources, includeKpis, includeTables, includeFormulas, period, profile, user])

  // ── Generate & Export ──
  const handleGenerate = async (format?: 'pdf' | 'xlsx' | 'csv' | 'html') => {
    setGenerating(true)
    try {
      const fmt = format || selectedFormat
      const options: ReportOptions = {
        includeCharts,
        includeFormulas,
        includeTables,
        includeKpis,
        orientation,
        format: fmt,
        colorScheme,
        pageSize,
        includeHeader: true,
        includeFooter: true,
        includePageNumbers: true,
      }

      await generateReport(reportContent, options)

      setToast(`Report downloaded successfully as ${fmt.toUpperCase()}`)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Failed to generate report', err)
      setToast('Failed to generate report. Please try again.')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setGenerating(false)
    }
  }

  // ── Toast helper ──
  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className={styles.page}>
      {/* ── Toast Notification ── */}
      {toast && (
        <div className={styles.toast}>
          <CheckCircle size={18} />
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className={styles.headerTop}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Reports</h1>
            <span className={styles.badge}>{dataSources.length} data sources</span>
          </div>
          <p className={styles.subtitle}>
            Report Builder · Generate professional reports with charts, KPIs, tables & statistical formulas
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              placeholder="Search data sources..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.actionBtn} onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinner : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className={styles.filterToolbar}>
        <div className={styles.filterTabs}>
          {PERIODS.map(p => (
            <button
              key={p}
              className={`${styles.filterTab} ${period === p ? styles.active : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className={styles.filterActions}>
          <span className={styles.filterLabel}>
            <BarChart3 size={12} /> SOURCES
          </span>
          <span className={styles.badge}>{filteredSources.length} total</span>
        </div>
      </div>

      {/* ── Report Builder Panel ── */}
      <div className={styles.builderPanel}>
        {/* Left: Content Selection */}
        <div className={styles.builderCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Report Content</h3>
              <p className={styles.cardSub}>Select the sections to include in your report</p>
            </div>
          </div>
          <div className={styles.sectionGroup}>
            {[
              { key: 'includeKpis', label: 'Key Performance Indicators', desc: 'Summary metrics with trends and changes', icon: <BarChart3 size={16} />, value: includeKpis, set: setIncludeKpis },
              { key: 'includeCharts', label: 'Charts & Visualizations', desc: 'Graphical representations of your data', icon: <BarChart3 size={16} />, value: includeCharts, set: setIncludeCharts },
              { key: 'includeTables', label: 'Data Tables', desc: 'Detailed raw data in tabular format', icon: <Table2 size={16} />, value: includeTables, set: setIncludeTables },
              { key: 'includeFormulas', label: 'Formulas & Methodology', desc: 'Statistical formulas and analytical methods used', icon: <Sigma size={16} />, value: includeFormulas, set: setIncludeFormulas },
            ].map(item => (
              <div
                key={item.key}
                className={`${styles.sectionToggle} ${item.value ? styles.active : ''}`}
                onClick={() => item.set(!item.value)}
              >
                <div className={`${styles.sectionToggleCheck} ${item.value ? styles.checked : ''}`}>
                  {item.value ? <CheckSquare size={14} /> : <Square size={14} />}
                </div>
                <div className={styles.sectionToggleInfo}>
                  <span className={styles.sectionToggleLabel}>{item.label}</span>
                  <span className={styles.sectionToggleDesc}>{item.desc}</span>
                </div>
                <div className={styles.sectionToggleIcon}>{item.icon}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Export Options */}
        <div className={styles.builderCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Export Settings</h3>
              <p className={styles.cardSub}>Configure format and styling options</p>
            </div>
          </div>
          <div className={styles.optionsGrid}>
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>Format</span>
              <select
                className={styles.optionSelect}
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value as any)}
              >
                <option value="pdf">PDF Document</option>
                <option value="xlsx">Excel Spreadsheet</option>
                <option value="csv">CSV File</option>
                <option value="html">HTML Web Page</option>
              </select>
            </div>
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>Orientation</span>
              <select
                className={styles.optionSelect}
                value={orientation}
                onChange={e => setOrientation(e.target.value as any)}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>Color Scheme</span>
              <select
                className={styles.optionSelect}
                value={colorScheme}
                onChange={e => setColorScheme(e.target.value as any)}
              >
                <option value="professional">Professional (Blue)</option>
                <option value="modern">Modern (Green)</option>
                <option value="minimal">Minimal (Black)</option>
              </select>
            </div>
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>Page Size</span>
              <select
                className={styles.optionSelect}
                value={pageSize}
                onChange={e => setPageSize(e.target.value as any)}
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview + Export Buttons ── */}
      <div className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} className={styles.filterLabel} />
            <span className={styles.previewTitle}>Report Preview</span>
            <span className={styles.badge}>{reportContent.sections.length} sections</span>
          </div>
          <div className={styles.previewActions}>
            {/* Quick export buttons */}
            <FormatButton format="pdf" label="PDF" color="#dc2626" onClick={() => handleGenerate('pdf')} disabled={generating} />
            <FormatButton format="xlsx" label="Excel" color="#16a34a" onClick={() => handleGenerate('xlsx')} disabled={generating} />
            <FormatButton format="csv" label="CSV" color="#2563eb" onClick={() => handleGenerate('csv')} disabled={generating} />
            <FormatButton format="html" label="HTML" color="#7c3aed" onClick={() => handleGenerate('html')} disabled={generating} />
            <button
              className={styles.generateBtn}
              onClick={() => handleGenerate()}
              disabled={generating}
            >
              {generating ? (
                <><div className={styles.spinner} /> Generating...</>
              ) : (
                <><FileDown size={16} /> Generate & Download</>
              )}
            </button>
          </div>
        </div>

        {/* ── Live Preview ── */}
        {loading ? (
          <div className={styles.previewEmpty}>
            <Loader2 size={24} style={{ animation: 'spin 0.6s linear infinite', margin: '0 auto 0.5rem' }} />
            Loading data sources...
          </div>
        ) : filteredSources.length === 0 ? (
          <div className={styles.previewEmpty}>
            <BarChart3 size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
            No data sources found. Upload data in the User Data page or add sales/customer data.
          </div>
        ) : (
          <div className={styles.reportPreview}>
            {/* Header */}
            <div className={styles.previewHeaderSection}>
              <h2>{reportContent.companyName}</h2>
              <p>{reportContent.reportTitle}</p>
              {reportContent.reportSubtitle && <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.3rem' }}>{reportContent.reportSubtitle}</p>}
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.7rem', opacity: 0.7, marginTop: '0.5rem' }}>
                <span>📅 {reportContent.generatedAt}</span>
                <span>👤 {reportContent.generatedBy}</span>
                <span>📊 {reportContent.period}</span>
              </div>
            </div>

            {/* Body */}
            <div className={styles.previewBody}>
              {reportContent.sections.map((section, idx) => (
                <div key={idx} className={styles.previewSection}>
                  <div className={styles.previewSectionTitle}>{section.title}</div>
                  {section.description && (
                    <div className={styles.previewSectionDesc}>{section.description}</div>
                  )}

                  {section.type === 'kpi' && (
                    <div className={styles.previewKpiGrid}>
                      {(section.content as any[]).slice(0, 8).map((k: any, i: number) => (
                        <div key={i} className={styles.previewKpiCard}>
                          <span className={styles.previewKpiLabel}>{k.label}</span>
                          <span className={styles.previewKpiValue} style={{
                            color: k.trendColor === 'up' ? '#16a34a' : k.trendColor === 'down' ? '#dc2626' : undefined
                          }}>
                            {k.value}
                          </span>
                          {k.change && (
                            <span className={styles.previewKpiChange}>
                              <ArrowUpRight size={10} style={{ verticalAlign: 'middle' }} /> {k.change}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'table' && (
                    <div style={{ overflowX: 'auto' }}>
                      <table className={styles.previewTable}>
                        <thead>
                          <tr>
                            {(section.content.headers as string[]).map((h: string, i: number) => (
                              <th key={i}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(section.content.rows as string[][]).slice(0, 5).map((row: string[], i: number) => (
                            <tr key={i}>
                              {row.map((cell: string, j: number) => (
                                <td key={j}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(section.content.rows as string[][]).length > 5 && (
                        <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                          Showing 5 of {(section.content.rows as string[][]).length} rows
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === 'formula' && (
                    <div className={styles.previewFormulaGrid}>
                      {(section.content as any[]).slice(0, 6).map((f: any, i: number) => (
                        <div key={i} className={styles.previewFormulaItem}>
                          <span className={styles.previewFormulaLabel}>{f.label}</span>
                          <code className={styles.previewFormulaCode}>{f.formula}</code>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'text' && (
                    <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.7 }}>{section.content as string}</p>
                  )}
                </div>
              ))}

              {/* Footer note */}
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 6, fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>
                {reportContent.companyName} · Confidential · Generated automatically by BizAnalytics Report Engine
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Format Button Component ── */
function FormatButton({ format, label, color, onClick, disabled }: {
  format: string
  label: string
  color: string
  onClick: () => void
  disabled: boolean
}) {
  const getBtnClass = () => {
    switch (format) {
      case 'pdf': return styles.exportBtnPdf
      case 'xlsx': return styles.exportBtnXlsx
      case 'csv': return styles.exportBtnCsv
      case 'html': return styles.exportBtnHtml
      default: return ''
    }
  }

  const icons: Record<string, React.ReactNode> = {
    pdf: <FileText size={14} />,
    xlsx: <Table2 size={14} />,
    csv: <FileDown size={14} />,
    html: <Eye size={14} />,
  }

  return (
    <button
      className={`${styles.exportBtn} ${getBtnClass()}`}
      onClick={onClick}
      disabled={disabled}
      title={`Download as ${format.toUpperCase()}`}
    >
      {icons[format] || <Download size={14} />}
      {label}
    </button>
  )
}