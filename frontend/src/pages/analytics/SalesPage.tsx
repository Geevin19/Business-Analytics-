import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const monthly = [
  { month: 'Jan', sales: 3200 }, { month: 'Feb', sales: 4100 }, { month: 'Mar', sales: 3800 },
  { month: 'Apr', sales: 5200 }, { month: 'May', sales: 4900 }, { month: 'Jun', sales: 6100 },
  { month: 'Jul', sales: 5800 }, { month: 'Aug', sales: 6800 }, { month: 'Sep', sales: 7200 },
  { month: 'Oct', sales: 7800 }, { month: 'Nov', sales: 7400 }, { month: 'Dec', sales: 8200 },
]

const daily = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`, sales: Math.floor(Math.random() * 300 + 100)
}))

export default function SalesPage() {
  return (
    <PageShell title="Sales Analytics" subtitle="Track daily, weekly, monthly and yearly sales performance.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="Today's Sales" value="$4,280" trend="6%" trendUp icon="📊" color="#6c63ff" />
        <StatCard label="This Week" value="$28,400" trend="4%" trendUp icon="📈" color="#10b981" />
        <StatCard label="This Month" value="$94,200" trend="12%" trendUp icon="📅" color="#f59e0b" />
        <StatCard label="This Year" value="$1.1M" trend="18%" trendUp icon="🏆" color="#3b82f6" />
      </div>
      <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Monthly Sales Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="sales" fill="#6c63ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Daily Sales (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#6c63ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
