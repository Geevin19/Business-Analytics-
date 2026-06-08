import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { DollarSign, ArrowUpRight, TrendingUp, PieChart as PieIcon } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import s from '@/styles/shared.module.css'

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12 } }

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
        <StatCard label="Budget Used" value="72%" icon={<PieIcon size={20} strokeWidth={1.8} />} />
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Cash Flow</div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={cashFlow}>
            <defs>
              <linearGradient id="in" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
            <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="inflow" stroke="#16a34a" fill="url(#in)" strokeWidth={2} name="Inflow" />
            <Area type="monotone" dataKey="outflow" stroke="#f43f5e" fill="url(#out)" strokeWidth={2} name="Outflow" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
