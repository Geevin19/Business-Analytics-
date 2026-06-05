import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const stock = [
  { product: 'Widget A', stock: 420, reorder: 100 }, { product: 'Widget B', stock: 85, reorder: 100 },
  { product: 'Widget C', stock: 310, reorder: 80 }, { product: 'Widget D', stock: 45, reorder: 80 },
  { product: 'Widget E', stock: 220, reorder: 60 }, { product: 'Widget F', stock: 30, reorder: 60 },
]

const lowStock = stock.filter(s => s.stock < s.reorder)

export default function InventoryPage() {
  return (
    <PageShell title="Inventory Analytics" subtitle="Stock monitoring, low stock alerts & turnover analysis.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="Total Products" value="248" trend="4%" trendUp icon="📦" color="#6c63ff" />
        <StatCard label="Low Stock Items" value={String(lowStock.length)} icon="⚠️" color="#f59e0b" />
        <StatCard label="Turnover Rate" value="4.8x" trend="0.3x" trendUp icon="🔄" color="#10b981" />
        <StatCard label="Out of Stock" value="3" icon="❌" color="#ef4444" />
      </div>

      {lowStock.length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <h4 style={{ color: '#c2410c', marginBottom: '0.5rem' }}>⚠️ Low Stock Alerts</h4>
          {lowStock.map(p => (
            <div key={p.product} style={{ fontSize: '0.875rem', color: '#92400e', padding: '0.25rem 0' }}>
              {p.product}: only {p.stock} units remaining (reorder point: {p.reorder})
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Stock Levels by Product</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stock}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="product" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="stock" fill="#6c63ff" radius={[6, 6, 0, 0]} name="Current Stock" />
            <Bar dataKey="reorder" fill="#fed7aa" radius={[6, 6, 0, 0]} name="Reorder Point" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
