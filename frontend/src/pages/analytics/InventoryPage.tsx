import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { Package, AlertTriangle, RefreshCw, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import s from '@/styles/shared.module.css'

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12 } }

const stock = [
  { product: 'Widget A', stock: 420, reorder: 100 }, { product: 'Widget B', stock: 85, reorder: 100 },
  { product: 'Widget C', stock: 310, reorder: 80 }, { product: 'Widget D', stock: 45, reorder: 80 },
  { product: 'Widget E', stock: 220, reorder: 60 }, { product: 'Widget F', stock: 30, reorder: 60 },
]

const lowStock = stock.filter(s => s.stock < s.reorder)

export default function InventoryPage() {
  return (
    <PageShell title="Inventory Analytics" subtitle="Stock monitoring, alerts and turnover analysis.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="Total Products" value="248" trend="4% added" trendUp icon={<Package size={20} strokeWidth={1.8} />} />
        <StatCard label="Low Stock Items" value={String(lowStock.length)} icon={<AlertTriangle size={20} strokeWidth={1.8} />} />
        <StatCard label="Turnover Rate" value="4.8x" trend="0.3x improvement" trendUp icon={<RefreshCw size={20} strokeWidth={1.8} />} />
        <StatCard label="Out of Stock" value="3" trendUp={false} icon={<XCircle size={20} strokeWidth={1.8} />} />
      </div>

      {lowStock.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #d97706', borderRadius: 10, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d97706', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Low Stock Alert</div>
          {lowStock.map(p => (
            <div key={p.product} style={{ fontSize: '0.855rem', color: 'var(--text-muted)', padding: '0.2rem 0' }}>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{p.product}</span>
              {' '}— {p.stock} units remaining (reorder at {p.reorder})
            </div>
          ))}
        </div>
      )}

      <div className={s.card}>
        <div className={s.cardTitle}>Stock Levels by Product</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stock}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="product" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
            <Tooltip {...ttip} />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="stock" fill="#166D16" radius={[4, 4, 0, 0]} maxBarSize={32} name="Current Stock" />
            <Bar dataKey="reorder" fill="#a3d4a3" radius={[4, 4, 0, 0]} maxBarSize={32} name="Reorder Point" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
