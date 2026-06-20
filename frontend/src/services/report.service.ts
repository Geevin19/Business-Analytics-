import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle } from 'docx'

/* ── Types ── */
export interface ReportContent {
  companyName: string
  reportTitle: string
  reportSubtitle?: string
  generatedAt: string
  generatedBy: string
  period: string
  sections: ReportSection[]
}

export interface ReportSection {
  title: string
  type: 'kpi' | 'chart' | 'table' | 'formula' | 'text'
  content: any
  description?: string
}

export interface ReportOptions {
  includeCharts: boolean
  includeFormulas: boolean
  includeTables: boolean
  includeKpis: boolean
  orientation: 'portrait' | 'landscape'
  format: 'pdf' | 'xlsx' | 'csv' | 'html' | 'docx'
  colorScheme: 'professional' | 'modern' | 'minimal'
  pageSize: 'A4' | 'Letter' | 'A3' | 'A5' | 'Legal' | 'Tabloid' | 'Executive' | 'B5'
  includeHeader: boolean
  includeFooter: boolean
  includePageNumbers: boolean
}

const COMPANY_DEFAULTS = {
  name: 'BizAnalytics',
  tagline: 'Data-Driven Business Intelligence Platform',
  website: 'bizanalytics.io',
}

const FORMULA_LABELS: Record<string, string> = {
  mean: 'Mean (μ) = (1/n) × Σxᵢ — average of all values',
  median: 'Median — Middle value when data is sorted (50th percentile)',
  stdDev: 'Std Dev (σ) = √( (1/n) × Σ(xᵢ - μ)² ) — measures data spread',
  variance: 'Variance (σ²) = (1/n) × Σ(xᵢ - μ)² — squared deviation from mean',
  min: 'Min = smallest value in dataset',
  max: 'Max = largest value in dataset',
  range: 'Range = Max - Min — total spread of data',
  trend: 'Trend% = ((last - first) / |first|) × 100 — direction & magnitude',
  r2: 'R² = 1 - (SS_res / SS_tot) — how well regression fits (0-1)',
  cgr: 'CGR = ((V_final / V_initial)^(1/(n-1)) - 1) × 100 — annualized growth',
  slope: 'm = (n×Σxy - Σx×Σy) / (n×Σx² - (Σx)²) — rate of change per unit',
  movingAvg: 'MA_k = (1/w) × Σ(x_i ... x_{i+w-1}) — smooths fluctuations (window=3)',
  forecast: 'F(t) = m×t + b — projects future values along regression line',
  seasonalIndex: 'S_i = (avg of period i / overall mean) × 100 — detects seasonal patterns',
}

const COLORS = {
  professional: { primary: '#1a365d', secondary: '#2d3748', accent: '#3182ce', bg: '#ffffff', text: '#1a202c', muted: '#718096', border: '#e2e8f0', headerBg: '#1a365d', headerText: '#ffffff' },
  modern: { primary: '#16a34a', secondary: '#2563eb', accent: '#f97316', bg: '#ffffff', text: '#0f172a', muted: '#94a3b8', border: '#e2e8f0', headerBg: '#16a34a', headerText: '#ffffff' },
  minimal: { primary: '#000000', secondary: '#333333', accent: '#555555', bg: '#ffffff', text: '#111111', muted: '#888888', border: '#dddddd', headerBg: '#000000', headerText: '#ffffff' },
}

// Page size dimensions (width x height) in mm
const PAGE_DIMS: Record<string, [number, number]> = {
  'A3': [297, 420],
  'A4': [210, 297],
  'A5': [148, 210],
  'Legal': [216, 356],
  'Letter': [216, 279],
  'Tabloid': [279, 432],
  'Executive': [184, 267],
  'B5': [176, 250],
}

/* ── Helpers ── */
function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K'
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)
}

function getTimestamp(): string {
  return new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ── HTML Report Generator ── */
function generateHTML(report: ReportContent, options: ReportOptions): string {
  const c = COLORS[options.colorScheme]
  const sections = report.sections.map(s => {
    switch (s.type) {
      case 'kpi':
        return `
          <div class="section">
            <h2>${s.title}</h2>
            ${s.description ? `<p class="desc">${s.description}</p>` : ''}
            <div class="kpi-grid">
              ${(s.content as any[]).map((k: any) => `
                <div class="kpi-card">
                  <span class="kpi-label">${k.label}</span>
                  <span class="kpi-value" style="color: ${k.trendColor === 'up' ? '#16a34a' : k.trendColor === 'down' ? '#dc2626' : c.text}">${k.value}</span>
                  ${k.change ? `<span class="kpi-change">${k.down ? '↓' : '↑'} ${k.change}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>`
      case 'table':
        return `
          <div class="section">
            <h2>${s.title}</h2>
            ${s.description ? `<p class="desc">${s.description}</p>` : ''}
            <div class="table-wrap">
              <table>
                <thead><tr>${(s.content.headers as string[]).map((h: string) => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>
                  ${(s.content.rows as string[][]).map((row: string[]) => `<tr>${row.map((c: string) => `<td>${c}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>`
      case 'formula':
        return `
          <div class="section">
            <h2>${s.title}</h2>
            ${s.description ? `<p class="desc">${s.description}</p>` : ''}
            <div class="formula-grid">
              ${(s.content as any[]).map((f: any) => `
                <div class="formula-item">
                  <span class="formula-label">${f.label}</span>
                  <code class="formula-code">${f.formula}</code>
                </div>
              `).join('')}
            </div>
          </div>`
      case 'text':
        return `
          <div class="section">
            <h2>${s.title}</h2>
            ${s.description ? `<p class="desc">${s.description}</p>` : ''}
            <p>${s.content}</p>
          </div>`
      case 'chart':
        return `<div class="section chart-section" id="chart-${s.title.replace(/\s+/g, '-')}"><h2>${s.title}</h2>${s.description ? `<p class="desc">${s.description}</p>` : ''}<p class="chart-placeholder">[Chart: ${s.title}]</p></div>`
      default:
        return ''
    }
  }).join('')

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: ${c.bg}; color: ${c.text}; line-height: 1.6; padding: 0; }
  .report-header { background: ${c.headerBg}; color: ${c.headerText}; padding: 2.5rem 3rem; }
  .report-header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; letter-spacing: -0.02em; }
  .report-header .tagline { font-size: 0.9rem; opacity: 0.85; margin-bottom: 0.75rem; }
  .report-meta { display: flex; gap: 2rem; font-size: 0.8rem; opacity: 0.8; flex-wrap: wrap; }
  .report-meta span { display: flex; align-items: center; gap: 0.3rem; }
  .report-body { padding: 2rem 3rem; }
  .section { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid ${c.border}; }
  .section:last-child { border-bottom: none; }
  .section h2 { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; color: ${c.primary}; }
  .desc { font-size: 0.85rem; color: ${c.muted}; margin-bottom: 1rem; }
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
  .kpi-card { padding: 1rem; border: 1px solid ${c.border}; border-radius: 8px; display: flex; flex-direction: column; gap: 0.25rem; }
  .kpi-label { font-size: 0.75rem; color: ${c.muted}; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
  .kpi-value { font-size: 1.5rem; font-weight: 700; }
  .kpi-change { font-size: 0.75rem; font-weight: 600; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th { background: ${c.border}; padding: 0.6rem 1rem; text-align: left; font-weight: 600; color: ${c.text}; border-bottom: 2px solid ${c.primary}; }
  td { padding: 0.5rem 1rem; border-bottom: 1px solid ${c.border}; }
  tr:hover td { background: #f7fafc; }
  .formula-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem; }
  .formula-item { padding: 0.75rem; border: 1px solid ${c.border}; border-radius: 6px; background: #f8fafc; }
  .formula-label { display: block; font-size: 0.8rem; font-weight: 600; color: ${c.primary}; margin-bottom: 0.3rem; }
  .formula-code { font-size: 0.78rem; color: ${c.text}; font-family: 'SF Mono', 'Fira Code', monospace; line-height: 1.5; }
  .chart-section { min-height: 200px; }
  .chart-placeholder { padding: 3rem; text-align: center; background: #f8fafc; border: 2px dashed ${c.border}; border-radius: 8px; color: ${c.muted}; font-size: 0.9rem; }
  .report-footer { padding: 1.5rem 3rem; border-top: 1px solid ${c.border}; font-size: 0.75rem; color: ${c.muted}; text-align: center; }
  @media print { .report-header { break-after: avoid; } .section { break-inside: avoid; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head><body>
  ${options.includeHeader ? `
  <div class="report-header">
    <h1>${report.companyName}</h1>
    <div class="tagline">${report.reportTitle}</div>
    ${report.reportSubtitle ? `<p style="font-size:0.95rem;opacity:0.9;margin-bottom:0.75rem">${report.reportSubtitle}</p>` : ''}
    <div class="report-meta">
      <span>📅 Generated: ${report.generatedAt}</span>
      <span>👤 By: ${report.generatedBy}</span>
      <span>📊 Period: ${report.period}</span>
    </div>
  </div>` : ''}
  <div class="report-body">
    ${sections}
  </div>
  ${options.includeFooter ? `<div class="report-footer"><p>${report.companyName} · ${COMPANY_DEFAULTS.tagline} · ${COMPANY_DEFAULTS.website} · Confidential</p>${options.includePageNumbers ? '<p style="margin-top:0.3rem">Page 1</p>' : ''}</div>` : ''}
</body></html>`
}

/* ── PDF Export ── */
export async function exportPDF(
  report: ReportContent,
  options: ReportOptions,
  chartElements?: HTMLElement[]
): Promise<void> {
  const c = COLORS[options.colorScheme]
  const dims = PAGE_DIMS[options.pageSize] || PAGE_DIMS.A4
  const pageW = options.orientation === 'landscape' ? dims[1] : dims[0]
  const pageH = options.orientation === 'landscape' ? dims[0] : dims[1]

  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: [pageW, pageH],
  })

  const margin = 20
  const contentW = pageW - 2 * margin
  let y = margin

  function checkPageBreak(needed: number) {
    if (y + needed > pageH - margin) {
      pdf.addPage()
      y = margin
    }
  }

  // ── Header ──
  if (options.includeHeader) {
    pdf.setFillColor(c.headerBg === '#1a365d' ? 26 : c.headerBg === '#000000' ? 0 : 22, 
                     c.headerBg === '#1a365d' ? 54 : c.headerBg === '#000000' ? 0 : 163,
                     c.headerBg === '#1a365d' ? 93 : c.headerBg === '#000000' ? 0 : 74)
    pdf.rect(0, 0, pageW, 45, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text(report.companyName, margin, 18)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(report.reportTitle, margin, 27)
    if (report.reportSubtitle) {
      pdf.setFontSize(9)
      pdf.text(report.reportSubtitle, margin, 33)
    }
    pdf.setFontSize(7)
    pdf.text(`Generated: ${report.generatedAt} | By: ${report.generatedBy} | Period: ${report.period}`, margin, 40)
    y = 55
  }

  // ── Sections ──
  for (const section of report.sections) {
    checkPageBreak(20)
    pdf.setFillColor(c.primary === '#1a365d' ? 26 : c.primary === '#16a34a' ? 22 : 0,
                     c.primary === '#1a365d' ? 54 : c.primary === '#16a34a' ? 163 : 0,
                     c.primary === '#1a365d' ? 93 : c.primary === '#16a34a' ? 74 : 0)
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text(section.title, margin, y + 4)
    pdf.rect(margin, y, contentW, 8, 'F')
    y += 14

    if (section.description) {
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'italic')
      const descLines = pdf.splitTextToSize(section.description, contentW)
      pdf.text(descLines, margin, y)
      y += descLines.length * 4 + 4
    }

    switch (section.type) {
      case 'kpi': {
        const items = section.content as any[]
        const perRow = 3
        const cardW = contentW / perRow - 3
        const cardH = 20
        for (let i = 0; i < items.length; i++) {
          if (i > 0 && i % perRow === 0) {
            checkPageBreak(cardH + 5)
          }
          const col = i % perRow
          const cx = margin + col * (cardW + 3)
          pdf.setDrawColor(220, 220, 220)
          pdf.setFillColor(250, 250, 250)
          pdf.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD')
          pdf.setTextColor(60, 60, 60)
          pdf.setFontSize(6)
          pdf.setFont('helvetica', 'bold')
          pdf.text(items[i].label.toUpperCase(), cx + 3, y + 5)
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          const valColor = items[i].trendColor === 'up' ? [22, 163, 74] as [number,number,number] : 
                           items[i].trendColor === 'down' ? [220, 38, 38] as [number,number,number] : [0, 0, 0] as [number,number,number]
          pdf.setTextColor(...valColor)
          pdf.text(items[i].value, cx + 3, y + 14)
          if (items[i].change) {
            pdf.setTextColor(items[i].down ? 220 : 22, items[i].down ? 38 : 163, items[i].down ? 38 : 74)
            pdf.setFontSize(6)
            pdf.text(`↕ ${items[i].change}`, cx + 3, y + 18)
          }
          if ((i + 1) % perRow === 0) y += cardH + 5
        }
        if (items.length % perRow !== 0) y += cardH + 5
        break
      }
      case 'table': {
        const headers = section.content.headers as string[]
        const rows = section.content.rows as string[][]
        const colW = contentW / headers.length

        pdf.setFillColor(26, 54, 93)
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'bold')
        headers.forEach((h, i) => {
          pdf.text(h, margin + i * colW + 2, y + 4)
        })
        pdf.rect(margin, y, contentW, 7, 'F')
        y += 9

        pdf.setFontSize(6.5)
        pdf.setFont('helvetica', 'normal')
        for (let i = 0; i < rows.length; i++) {
          checkPageBreak(6)
          if (i % 2 === 0) {
            pdf.setFillColor(248, 250, 252)
            pdf.rect(margin, y - 1.5, contentW, 6, 'F')
          }
          pdf.setTextColor(60, 60, 60)
          rows[i].forEach((cell, j) => {
            pdf.text(cell, margin + j * colW + 2, y + 2)
          })
          y += 6
        }
        break
      }
      case 'formula': {
        const formulas = section.content as any[]
        for (let i = 0; i < formulas.length; i++) {
          checkPageBreak(12)
          pdf.setDrawColor(220, 220, 220)
          pdf.setFillColor(248, 250, 252)
          pdf.roundedRect(margin, y, contentW, 10, 2, 2, 'FD')
          pdf.setTextColor(22, 163, 74)
          pdf.setFontSize(7)
          pdf.setFont('helvetica', 'bold')
          pdf.text(formulas[i].label, margin + 3, y + 4)
          pdf.setTextColor(60, 60, 60)
          pdf.setFontSize(6)
          pdf.setFont('helvetica', 'normal')
          const fLines = pdf.splitTextToSize(formulas[i].formula, contentW - 10)
          pdf.text(fLines, margin + 3, y + 7)
          y += 12
        }
        break
      }
      case 'text': {
        pdf.setTextColor(60, 60, 60)
        pdf.setFontSize(8.5)
        pdf.setFont('helvetica', 'normal')
        const tLines = pdf.splitTextToSize(section.content as string, contentW)
        checkPageBreak(tLines.length * 4 + 5)
        pdf.text(tLines, margin, y)
        y += tLines.length * 4 + 5
        break
      }
    }
    y += 5
  }

  // ── Footer ──
  if (options.includeFooter) {
    pdf.setFontSize(6)
    pdf.setTextColor(150, 150, 150)
    pdf.text(`${report.companyName} · ${COMPANY_DEFAULTS.tagline} · Confidential`, margin, pageH - 10)
    if (options.includePageNumbers) {
      pdf.text(`Page 1`, pageW - margin - 10, pageH - 10, { align: 'right' })
    }
  }

  pdf.save(`${report.reportTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
}

/* ── DOCX Export ── */
export async function exportDOCX(report: ReportContent, options: ReportOptions): Promise<void> {
  const children: (Paragraph | Table)[] = []

  // Title
  children.push(
    new Paragraph({
      text: report.companyName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: report.reportTitle,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `${report.generatedAt} | ${report.generatedBy} | ${report.period}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  if (report.reportSubtitle) {
    children.push(
      new Paragraph({
        text: report.reportSubtitle,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    )
  }

  // Sections
  report.sections.forEach(section => {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 100 },
      })
    )

    if (section.description) {
      children.push(
        new Paragraph({
          text: section.description,
          spacing: { after: 200 },
        })
      )
    }

    switch (section.type) {
      case 'kpi': {
        const items = section.content as any[]
        const tableRows: TableRow[] = [
          new TableRow({
            tableHeader: true,
            children: ['Metric', 'Value', 'Change'].map(h =>
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: h, bold: true })]
                })],
              })
            ),
          }),
        ]
        items.forEach((k: any) => {
          tableRows.push(
            new TableRow({
              children: [k.label, k.value, k.change || '-'].map(cellText =>
                new TableCell({
                  children: [new Paragraph({ text: cellText })],
                })
              ),
            })
          )
        })
        children.push(
          new Table({
            rows: tableRows,
          }),
          new Paragraph({ spacing: { after: 200 } })
        )
        break
      }
      case 'table': {
        const headers = section.content.headers as string[]
        const rows = section.content.rows as string[][]
        const tableRows: TableRow[] = [
          new TableRow({
            tableHeader: true,
            children: headers.map(h =>
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: h, bold: true })]
                })],
              })
            ),
          }),
        ]
        rows.forEach((row: string[]) => {
          tableRows.push(
            new TableRow({
              children: row.map(cellText =>
                new TableCell({
                  children: [new Paragraph({ text: cellText })],
                })
              ),
            })
          )
        })
        children.push(
          new Table({
            rows: tableRows,
          }),
          new Paragraph({ spacing: { after: 200 } })
        )
        break
      }
      case 'formula': {
        const formulas = section.content as any[]
        formulas.forEach((f: any) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: f.label, bold: true }),
                new TextRun({ text: `  —  ${f.formula}`, italics: true }),
              ],
              spacing: { after: 100 },
            })
          )
        })
        break
      }
      case 'text': {
        children.push(
          new Paragraph({
            text: section.content as string,
            spacing: { after: 200 },
          })
        )
        break
      }
    }
  })

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: options.orientation === 'landscape' ? PAGE_DIMS[options.pageSize][1] * 28346 / 25.4 : PAGE_DIMS[options.pageSize][0] * 28346 / 25.4,
            height: options.orientation === 'landscape' ? PAGE_DIMS[options.pageSize][0] * 28346 / 25.4 : PAGE_DIMS[options.pageSize][1] * 28346 / 25.4,
          },
        },
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${report.reportTitle.replace(/\s+/g, '_')}_${Date.now()}.docx`)
}

/* ── Excel Export ── */
export function exportExcel(report: ReportContent, options: ReportOptions): void {
  const wb = XLSX.utils.book_new()

  const summaryData: any[][] = [
    ['Company', report.companyName],
    ['Report', report.reportTitle],
    ['Generated', report.generatedAt],
    ['Period', report.period],
    ['Generated By', report.generatedBy],
    [],
  ]

  report.sections.forEach(section => {
    summaryData.push([section.title.toUpperCase()])
    if (section.description) summaryData.push(['', section.description])

    switch (section.type) {
      case 'kpi': {
        summaryData.push(['Metric', 'Value', 'Change', 'Trend'])
        ;(section.content as any[]).forEach((k: any) => {
          summaryData.push([k.label, k.value, k.change || '-', k.trendColor || '-'])
        })
        break
      }
      case 'table': {
        summaryData.push(section.content.headers)
        ;(section.content.rows as string[][]).forEach((row: string[]) => {
          summaryData.push(row)
        })
        break
      }
      case 'formula': {
        summaryData.push(['Metric', 'Formula'])
        ;(section.content as any[]).forEach((f: any) => {
          summaryData.push([f.label, f.formula])
        })
        break
      }
      case 'text': {
        summaryData.push([section.content])
        break
      }
    }
    summaryData.push([])
  })

  const ws = XLSX.utils.aoa_to_sheet(summaryData)
  ws['!cols'] = [{ wch: 30 }, { wch: 50 }, { wch: 20 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Report Summary')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, `${report.reportTitle.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
}

/* ── CSV Export ── */
export function exportCSV(report: ReportContent): void {
  let csv = `"${report.reportTitle}"\n`
  csv += `"Company","${report.companyName}"\n`
  csv += `"Generated","${report.generatedAt}"\n`
  csv += `"Period","${report.period}"\n\n`

  report.sections.forEach(section => {
    csv += `"${section.title}"\n`
    switch (section.type) {
      case 'kpi': {
        csv += '"Metric","Value","Change"\n'
        ;(section.content as any[]).forEach((k: any) => {
          csv += `"${k.label}","${k.value}","${k.change || '-'}"\n`
        })
        break
      }
      case 'table': {
        csv += '"' + section.content.headers.join('","') + '"\n'
        ;(section.content.rows as string[][]).forEach((row: string[]) => {
          csv += '"' + row.join('","') + '"\n'
        })
        break
      }
      case 'formula': {
        csv += '"Metric","Formula"\n'
        ;(section.content as any[]).forEach((f: any) => {
          csv += `"${f.label}","${f.formula}"\n`
        })
        break
      }
      case 'text': {
        csv += `"${section.content}"\n`
        break
      }
    }
    csv += '\n'
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${report.reportTitle.replace(/\s+/g, '_')}_${Date.now()}.csv`)
}

/* ── HTML Export ── */
export function exportHTML(report: ReportContent, options: ReportOptions): void {
  const html = generateHTML(report, options)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `${report.reportTitle.replace(/\s+/g, '_')}_${Date.now()}.html`)
}

/* ── Main Export Dispatcher ── */
export async function generateReport(
  report: ReportContent,
  options: ReportOptions,
  chartElements?: HTMLElement[]
): Promise<void> {
  switch (options.format) {
    case 'pdf':
      return exportPDF(report, options, chartElements)
    case 'docx':
      return exportDOCX(report, options)
    case 'xlsx':
      return exportExcel(report, options)
    case 'csv':
      return exportCSV(report)
    case 'html':
      return exportHTML(report, options)
    default:
      return exportPDF(report, options, chartElements)
  }
}

export { COLORS as REPORT_COLORS, COMPANY_DEFAULTS, FORMULA_LABELS, formatNumber, getTimestamp, PAGE_DIMS }