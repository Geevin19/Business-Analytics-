import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { DollarSign, ArrowUpRight, TrendingUp, PieChart as PieIcon } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const C = { card: { background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #e8eaf0' } }
const ttip = { contentStyle: { borderRadius: 8, border: '1px solid #e8eaf0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }
const axis = { axisLine: false, tickLine: false }

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
    <PageShell title="Financial Analytics" subtitle="Revenue, expenses, profit and cash flow monitoring.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="Total Revenue" value="$1.1M" trend="18% vs last year" trendUp icon={<DollarSign size={20} strokeWidth={1.8} />} />
        <StatCard label="Total Expenses" value="$573K" trend="8% increase" trendUp={false} icon={<ArrowUpRight size={20} strokeWidth={1.8} />} />
        <StatCard label="Net Profit" value="$527K" trend="22% vs last year" trendUp icon={<TrendingUp size={20} strokeWidth={1.8} />} />
        <StatCard label="Budget Used" value="72%" trend="3% vs target" trendUp icon={<PieIcon size={20} strokeWidth={1.8} />} />
      </div>

      <div style={C.card}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>Cash Flow</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={cashFlow}>
            <defs>
              <linearGradient id="in" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="inflow" stroke="#4f46e5" fill="url(#in)" strokeWidth={2} name="Inflow" />
            <Area type="monotone" dataKey="outflow" stroke="#f43f5e" fill="url(#out)" strokeWidth={2} name="Outflow" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
