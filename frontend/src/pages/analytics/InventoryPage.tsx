import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { Package, AlertTriangle, RefreshCw, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const C = { card: { background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #e8eaf0' } }
const ttip = { contentStyle: { borderRadius: 8, border: '1px solid #e8eaf0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }
const axis = { axisLine: false, tickLine: false }

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
        <div style={{ background: '#fafafa', border: '1px solid #e8eaf0', borderLeft: '3px solid #f59e0b', borderRadius: 10, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Low Stock Alert</div>
          {lowStock.map(p => (
            <div key={p.product} style={{ fontSize: '0.855rem', color: '#64748b', padding: '0.2rem 0', display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{p.product}</span>
              <span>— {p.stock} units remaining (reorder at {p.reorder})</span>
            </div>
          ))}
        </div>
      )}

      <div style={C.card}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>Stock Levels by Product</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stock}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="product" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <Tooltip {...ttip} />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="stock" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={32} name="Current Stock" />
            <Bar dataKey="reorder" fill="#c7d2fe" radius={[4, 4, 0, 0]} maxBarSize={32} name="Reorder Point" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
