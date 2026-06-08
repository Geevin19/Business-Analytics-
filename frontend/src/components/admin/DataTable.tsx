import { ReactNode, useMemo, useState } from 'react'
import s from './admin.module.css'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  searchKeys?: (keyof T)[]
  searchPlaceholder?: string
  filters?: { key: keyof T; label: string; options: string[] }[]
  pageSize?: number
  actions?: (row: T) => ReactNode
}

export default function DataTable<T extends object>({
  columns,
  data,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  filters = [],
  pageSize = 8,
  actions,
}: Props<T>) {
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const filtered = useMemo(() => {
    let rows = [...data]
    if (search && searchKeys.length) {
      const q = search.toLowerCase()
      rows = rows.filter(row =>
        searchKeys.some(k => String((row as Record<string, unknown>)[k as string] ?? '').toLowerCase().includes(q))
      )
    }
    filters.forEach(f => {
      const val = filterValues[String(f.key)]
      if (val) rows = rows.filter(row => String((row as Record<string, unknown>)[f.key as string]) === val)
    })
    if (sortKey) {
      rows.sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? '')
        const bv = String((b as Record<string, unknown>)[sortKey] ?? '')
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return rows
  }, [data, search, searchKeys, filters, filterValues, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  return (
    <>
      <div className={s.toolbar}>
        {searchKeys.length > 0 && (
          <input
            className={s.searchInput}
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
          />
        )}
        {filters.map(f => (
          <select
            key={String(f.key)}
            className={s.select}
            value={filterValues[String(f.key)] ?? ''}
            onChange={e => { setFilterValues(v => ({ ...v, [String(f.key)]: e.target.value })); setPage(0) }}
          >
            <option value="">{f.label}</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ cursor: 'pointer' }} onClick={() => handleSort(col.key)}>
                  {col.header}{sortKey === col.key ? (sortAsc ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className={s.empty}>No records found.</td></tr>
            )}
            {paged.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>{col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}</td>
                ))}
                {actions && <td>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={s.pagination}>
          <span>Showing {paged.length} of {filtered.length}</span>
          <div className={s.paginationBtns}>
            <button className={s.btnSecondary} disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
            <button className={s.btnSecondary} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </>
  )
}
