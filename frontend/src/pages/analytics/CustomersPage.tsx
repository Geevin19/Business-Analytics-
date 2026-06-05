import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

const COLORS = ['#6c63ff', '#10b981', '#f59e0b', '#ef4444']

export default function CustomersPage() {
  return (
    <PageShell title="Customer Analytics" subtitle="Growth tracking, segmentation, retention & purchase behavior.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="Total Customers" value="12,491" trend="5%" trendUp icon="👥" color="#6c63ff" />
        <StatCard label="New This Month" value="342" trend="9%" trendUp icon="🆕" color="#10b981" />
        <StatCard label="Retention Rate" value="84%" trend="2%" trendUp icon="🔄" color="#f59e0b" />
        <StatCard label="Churn Rate" value="3.2%" trend="0.5%" trendUp={false} icon="📉" color="#ef4444" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Customer Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#6c63ff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Segmentation</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={segments} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {segments.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageShell>
  )
}
