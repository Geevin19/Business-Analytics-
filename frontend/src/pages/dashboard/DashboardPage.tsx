import StatCard from '@/components/ui/StatCard'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import styles from './DashboardPage.module.css'

const revenueData = [
  { month: 'Jan', revenue: 42000, expenses: 28000 },
  { month: 'Feb', revenue: 48000, expenses: 30000 },
  { month: 'Mar', revenue: 55000, expenses: 32000 },
  { month: 'Apr', revenue: 51000, expenses: 29000 },
  { month: 'May', revenue: 63000, expenses: 35000 },
  { month: 'Jun', revenue: 71000, expenses: 38000 },
  { month: 'Jul', revenue: 68000, expenses: 36000 },
  { month: 'Aug', revenue: 78000, expenses: 40000 },
  { month: 'Sep', revenue: 82000, expenses: 42000 },
  { month: 'Oct', revenue: 90000, expenses: 45000 },
  { month: 'Nov', revenue: 87000, expenses: 43000 },
  { month: 'Dec', revenue: 94200, expenses: 48000 },
]

const salesByRegion = [
  { name: 'North', value: 35 },
  { name: 'South', value: 22 },
  { name: 'East', value: 28 },
  { name: 'West', value: 15 },
]

const COLORS = ['#6c63ff', '#10b981', '#f59e0b', '#ef4444']

const topProducts = [
  { product: 'Product A', sales: 4200 },
  { product: 'Product B', sales: 3800 },
  { product: 'Product C', sales: 3100 },
  { product: 'Product D', sales: 2700 },
  { product: 'Product E', sales: 2200 },
]

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back! Here's your business overview.</p>
        </div>
        <div className={styles.dateRange}>
          <span>📅 Last 12 months</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total Revenue" value="$94,200" trend="12% vs last month" trendUp icon="💰" color="#6c63ff" />
        <StatCard label="Total Sales" value="3,842" trend="8% vs last month" trendUp icon="📈" color="#10b981" />
        <StatCard label="Total Customers" value="12,491" trend="5% vs last month" trendUp icon="👥" color="#f59e0b" />
        <StatCard label="Total Orders" value="1,203" trend="3% vs last month" trendUp icon="📦" color="#3b82f6" />
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3>Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#6c63ff" fill="url(#rev)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#exp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3>Sales by Region</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={salesByRegion} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {salesByRegion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartCard}>
        <h3>Top Products by Sales</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="product" type="category" tick={{ fontSize: 11 }} width={80} />
            <Tooltip />
            <Bar dataKey="sales" fill="#6c63ff" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
