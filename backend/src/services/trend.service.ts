import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'

/**
 * Mathematical trend analysis service
 * Analyzes numeric data from uploaded files and computes trends
 */

export interface TrendResult {
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

export interface UploadedData {
  id: string
  userId: string
  fileName: string
  fileType: string
  uploadedAt: string
  rowCount: number
  columnNames: string[]
  numericColumns: string[]
  analysis: Record<string, TrendResult>
  rawPreview: Record<string, any>[]
}

// Store datasets per user: Map<userId, UploadedData[]>
const userDatasets = new Map<string, UploadedData[]>()

function getUserDatasets(userId: string): UploadedData[] {
  if (!userDatasets.has(userId)) {
    userDatasets.set(userId, [])
  }
  return userDatasets.get(userId)!
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function mode(arr: number[]): number[] {
  const freq: Record<number, number> = {}
  arr.forEach(v => { freq[v] = (freq[v] || 0) + 1 })
  const maxFreq = Math.max(...Object.values(freq))
  if (maxFreq === 1) return []
  return Object.entries(freq).filter(([, f]) => f === maxFreq).map(([k]) => Number(k))
}

function stdDev(arr: number[]): number {
  const m = mean(arr)
  const sqDiffs = arr.map(v => (v - m) ** 2)
  return Math.sqrt(sqDiffs.reduce((s, v) => s + v, 0) / arr.length)
}

function variance(arr: number[]): number {
  const m = mean(arr)
  const sqDiffs = arr.map(v => (v - m) ** 2)
  return sqDiffs.reduce((s, v) => s + v, 0) / arr.length
}

function movingAverage(arr: number[], window: number = 3): number[] {
  const result: number[] = []
  for (let i = 0; i <= arr.length - window; i++) {
    result.push(mean(arr.slice(i, i + window)))
  }
  return result
}

function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
  const n = x.length
  const mx = mean(x)
  const my = mean(y)
  const xy = x.map((xi, i) => xi * y[i]).reduce((s, v) => s + v, 0)
  const x2 = x.map(v => v * v).reduce((s, v) => s + v, 0)
  const y2 = y.map(v => v * v).reduce((s, v) => s + v, 0)

  const slope = (n * xy - x.reduce((s, v) => s + v, 0) * y.reduce((s, v) => s + v, 0)) /
    (n * x2 - (x.reduce((s, v) => s + v, 0)) ** 2)

  const intercept = my - slope * mx

  const ssRes = y.reduce((s, yi, i) => s + (yi - (slope * x[i] + intercept)) ** 2, 0)
  const ssTot = y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  const r2 = 1 - ssRes / ssTot

  return { slope, intercept, r2 }
}

function forecast(arr: number[], steps: number = 5): number[] {
  const x = arr.map((_, i) => i)
  const { slope, intercept } = linearRegression(x, arr)
  const forecasts: number[] = []
  for (let i = 0; i < steps; i++) {
    forecasts.push(slope * (arr.length + i) + intercept)
  }
  return forecasts
}

function growthRate(arr: number[]): number[] {
  const rates: number[] = []
  for (let i = 1; i < arr.length; i++) {
    rates.push(arr[i] > 0 ? ((arr[i] - arr[i - 1]) / arr[i - 1]) * 100 : 0)
  }
  return rates
}

function compoundGrowthRate(arr: number[]): number {
  if (arr.length < 2 || arr[0] === 0) return 0
  return ((arr[arr.length - 1] / arr[0]) ** (1 / (arr.length - 1)) - 1) * 100
}

function seasonalIndex(arr: number[], period: number = 4): number[] {
  if (arr.length < period * 2) return []
  const m = mean(arr)
  const indices: number[] = []
  for (let i = 0; i < period; i++) {
    let sum = 0
    let count = 0
    for (let j = i; j < arr.length; j += period) {
      sum += arr[j]
      count++
    }
    indices.push(((sum / count) / m) * 100)
  }
  return indices
}

function analyzeColumn(values: number[], labels: string[]): TrendResult {
  const rawData = values
  const avg = mean(values)
  const med = median(values)
  const mod = mode(values)
  const sd = stdDev(values)
  const var_ = variance(values)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const rng = max - min

  const trendPercent = values.length >= 2
    ? ((values[values.length - 1] - values[0]) / Math.abs(values[0] || 1)) * 100
    : 0

  const trend: 'up' | 'down' | 'stable' =
    trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'stable'

  const ma = movingAverage(values)
  const fc = forecast(values)
  const gr = growthRate(values)
  const cgr = compoundGrowthRate(values)

  const x = values.map((_, i) => i)
  const lr = linearRegression(x, values)
  const si = seasonalIndex(values)

  return {
    rawData, labels,
    mean: avg, median: med, mode: mod,
    stdDev: sd, variance: var_,
    min, max, range: rng,
    trend, trendPercentage: Math.round(trendPercent * 100) / 100,
    movingAverage: ma,
    forecast: fc,
    linearRegression: lr,
    seasonalIndex: si,
    growthRate: gr,
    compoundGrowthRate: cgr,
  }
}

function parseCSV(content: string): Record<string, any>[] {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, any>[]
  return records
}

function parseJSON(content: string): Record<string, any>[] {
  const parsed = JSON.parse(content)
  if (Array.isArray(parsed)) return parsed
  if (typeof parsed === 'object' && parsed !== null) {
    if (Array.isArray(parsed.data)) return parsed.data
    if (Array.isArray(parsed.records)) return parsed.records
    const keys = Object.keys(parsed)
    if (keys.length > 0 && Array.isArray(parsed[keys[0]])) {
      const length = parsed[keys[0]].length
      return Array.from({ length }, (_, i) => {
        const obj: Record<string, any> = {}
        keys.forEach(k => { obj[k] = parsed[k][i] })
        return obj
      })
    }
    return [parsed]
  }
  return []
}

function parseText(content: string): Record<string, any>[] {
  const lines = content.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const separators = ['\t', '|', ';', ',']
  let sep = ','
  for (const s of separators) {
    if (lines[0].includes(s)) { sep = s; break }
  }

  const headers = lines[0].split(sep).map(h => h.trim())
  const records = lines.slice(1).map(line => {
    const values = line.split(sep).map(v => v.trim())
    const obj: Record<string, any> = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
    return obj
  })
  return records
}

function parseExcel(buffer: Buffer): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []
  const sheet = workbook.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' })
  return json
}

/** Parse a value to number, handling currency, commas, percentages, etc. */
function parseNumericValue(val: any): number | null {
  if (val === null || val === undefined || val === '') return null
  if (typeof val === 'number') return isNaN(val) ? null : val

  let str = String(val).trim()

  // Remove common non-numeric prefixes/suffixes
  str = str.replace(/^[$€£¥₹\s]+/, '')   // leading currency symbols
  str = str.replace(/[%\s]+$/, '')        // trailing percent sign
  str = str.replace(/,/g, '')             // thousands separator commas

  // Handle parentheses for negative numbers: (1,234) → -1234
  if (/^\(.*\)$/.test(str)) {
    str = '-' + str.slice(1, -1)
  }

  const num = Number(str)
  return isNaN(num) ? null : num
}

function detectNumericColumns(records: Record<string, any>[]): string[] {
  if (records.length === 0) return []
  const numericCols: string[] = []
  Object.keys(records[0]).forEach(col => {
    const parsed = records.map(r => parseNumericValue(r[col]))
    const nums = parsed.filter((n): n is number => n !== null)
    // Accept column if at least 1 value parsed as number and >= 20% of values are numeric
    if (nums.length > 0 && (nums.length >= records.length * 0.2 || nums.length >= 3)) {
      numericCols.push(col)
    }
  })
  return numericCols
}

function extractLabels(records: Record<string, any>[]): string[] {
  const firstKeys = Object.keys(records[0] || {})
  const dateLike = firstKeys.find(k =>
    /date|time|year|month|day|period|label|name/i.test(k)
  )
  if (dateLike) {
    return records.map(r => String(r[dateLike] ?? ''))
  }
  for (const key of firstKeys) {
    const allNonNumeric = records.every(r => isNaN(Number(r[key])))
    if (allNonNumeric && records.length > 0) {
      return records.map(r => String(r[key] ?? ''))
    }
  }
  return records.map((_, i) => `Point ${i + 1}`)
}

export function processUpload(
  userId: string,
  id: string,
  fileName: string,
  fileType: string,
  content: string,
  buffer?: Buffer
): UploadedData {
  let records: Record<string, any>[]

  if (fileType === 'csv') {
    records = parseCSV(content)
  } else if (fileType === 'json') {
    records = parseJSON(content)
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    records = buffer ? parseExcel(buffer) : parseText(content)
  } else {
    records = parseText(content)
  }

  const columnNames = records.length > 0 ? Object.keys(records[0]) : []
  const numericColumns = detectNumericColumns(records)
  const labels = extractLabels(records)

  const analysis: Record<string, TrendResult> = {}
  numericColumns.forEach(col => {
    const values = records.map(r => parseNumericValue(r[col])).filter((n): n is number => n !== null)
    if (values.length > 1) {
      analysis[col] = analyzeColumn(values, labels.slice(0, values.length))
    }
  })

  const uploaded: UploadedData = {
    id,
    userId,
    fileName,
    fileType,
    uploadedAt: new Date().toISOString(),
    rowCount: records.length,
    columnNames,
    numericColumns,
    analysis,
    rawPreview: records.slice(0, 50),
  }

  const datasets = getUserDatasets(userId)
  datasets.unshift(uploaded)
  if (datasets.length > 50) datasets.pop()

  return uploaded
}

export function getAllDatasets(userId: string): UploadedData[] {
  return getUserDatasets(userId)
}

export function getDatasetById(userId: string, id: string): UploadedData | undefined {
  return getUserDatasets(userId).find(d => d.id === id)
}

export function deleteDataset(userId: string, id: string): boolean {
  const datasets = getUserDatasets(userId)
  const idx = datasets.findIndex(d => d.id === id)
  if (idx === -1) return false
  datasets.splice(idx, 1)
  return true
}

export function clearAllDatasets(userId: string): void {
  const datasets = getUserDatasets(userId)
  datasets.length = 0
}