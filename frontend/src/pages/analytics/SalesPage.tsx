import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { TrendingUp, Calendar, BarChart2, Award } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import s from '@/styles/shared.module.css'

const monthly = [
  { month: 'Jan', sales: 3200 }, { month: 'Feb', sales: 4100 }, { month: 'Mar', sales: 3800 },
  { month: 'Apr', sales: 5200 }, { month: 'May', sales: 4900 }, { month: 'Jun', sales: 6100 },
  { month: 'Jul', sales: 5800 }, { month: 'Aug', sales: 6800 }, { month: 'Sep', sales: 7200 },
  { month: 'Oct', sales: 7800 }, { month: 'Nov', sales: 7400 }, { month: 'Dec', sales: 8200 },
]

const daily = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`, sales: Math.floor(Math.random() * 300 + 100)
}))

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12 } }

export default function SalesPage() {
  return (
    <PageShell title="Sales Analytics" subtitle="Daily, weekly, monthly and yearly performance.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="Today" value="$4,280" trend="6% vs yesterday" trendUp icon={<TrendingUp size={20} strokeWidth={1.8} />} />
        <StatCard label="This Week" value="$28,400" trend="4% vs last week" trendUp icon={<Calendar size={20} strokeWidth={1.8} />} />
        <StatCard label="This Month" value="$94,200" trend="12% vs last month" trendUp icon={<BarChart2 size={20} strokeWidth={1.8} />} />
        <StatCard label="This Year" value="$1.1M" trend="18% vs last year" trendUp icon={<Award size={20} strokeWidth={1.8} />} />
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Monthly Sales Trend</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
            <Tooltip {...ttip} />
            <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Daily Sales — Last 30 Days</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} {...axis} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} {...axis} />
            <Tooltip {...ttip} />
            <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
