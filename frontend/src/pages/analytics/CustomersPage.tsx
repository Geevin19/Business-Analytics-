import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { Users, UserPlus, RefreshCw, UserMinus } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import s from '@/styles/shared.module.css'

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12 } }

const growth = [
  { month: 'Jan', customers: 8200 }, { month: 'Feb', customers: 8800 }, { month: 'Mar', customers: 9400 },
  { month: 'Apr', customers: 9900 }, { month: 'May', customers: 10500 }, { month: 'Jun', customers: 11000 },
  { month: 'Jul', customers: 11400 }, { month: 'Aug', customers: 11800 }, { month: 'Sep', customers: 12100 },
  { month: 'Oct', customers: 12300 }, { month: 'Nov', customers: 12420 }, { month: 'Dec', customers: 12491 },
]

const segments = [
  { name: 'Premium', value: 15 }, { name: 'Regular', value: 55 },
  { name: 'New', value: 20 }, { name: 'Churned', value: 10 },
]

const COLORS = ['#16a34a', '#22c55e', '#10b981', '#15803d']

export default function CustomersPage() {
  return (
    <PageShell title="Customer Analytics" subtitle="Growth, segmentation, retention and purchase behavior.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="Total Customers" value="12,491" trend="5% vs last month" trendUp icon={<Users size={20} strokeWidth={1.8} />} />
        <StatCard label="New This Month" value="342" trend="9% vs last month" trendUp icon={<UserPlus size={20} strokeWidth={1.8} />} />
        <StatCard label="Retention Rate" value="84%" trend="2% vs last month" trendUp icon={<RefreshCw size={20} strokeWidth={1.8} />} />
        <StatCard label="Churn Rate" value="3.2%" trend="0.5% increase" trendUp={false} icon={<UserMinus size={20} strokeWidth={1.8} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className={s.card}>
          <div className={s.cardTitle}>Customer Growth</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
              <Tooltip {...ttip} />
              <Line type="monotone" dataKey="customers" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={s.card}>
          <div className={s.cardTitle}>Segmentation</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={segments} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {segments.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...ttip} formatter={(v: number) => `${v}%`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageShell>
  )
}
