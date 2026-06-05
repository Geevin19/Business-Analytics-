import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const cashFlow = [
  { month: 'Jan', inflow: 52000, outflow: 38000 }, { month: 'Feb', inflow: 58000, outflow: 42000 },
  { month: 'Mar', inflow: 61000, outflow: 40000 }, { month: 'Apr', inflow: 55000, outflow: 44000 },
  { month: 'May', inflow: 68000, outflow: 46000 }, { month: 'Jun', inflow: 74000, outflow: 48000 },
  { month: 'Jul', inflow: 71000, outflow: 47000 }, { month: 'Aug', inflow: 80000, outflow: 50000 },
  { month: 'Sep', inflow: 86000, outflow: 52000 }, { month: 'Oct', inflow: 92000, outflow: 55000 },
  { month: 'Nov', inflow: 89000, outflow: 53000 }, { month: 'Dec', inflow: 96000, outflow: 58000 },
]

export default function FinancePage() {
  return (
    <PageShell title="Financial Analytics" subtitle="Revenue, expenses, profit analysis & cash flow monitoring.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="Total Revenue" value="$1.1M" trend="18%" trendUp icon="💰" color="#6c63ff" />
        <StatCard label="Total Expenses" value="$573K" trend="8%" trendUp={false} icon="📤" color="#ef4444" />
        <StatCard label="Net Profit" value="$527K" trend="22%" trendUp icon="💹" color="#10b981" />
        <StatCard label="Budget Used" value="72%" trend="3%" trendUp icon="📊" color="#f59e0b" />
      </div>
      <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Cash Flow Dashboard</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cashFlow}>
            <defs>
              <linearGradient id="in" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="url(#in)" strokeWidth={2} name="Cash Inflow" />
            <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="url(#out)" strokeWidth={2} name="Cash Outflow" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
