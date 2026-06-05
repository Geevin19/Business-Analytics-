import StatCard from '@/components/ui/StatCard'
import { DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react'
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

const CHART_COLORS = ['#4f46e5', '#818cf8', '#6366f1', '#a5b4fc']

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
          <p className={styles.subtitle}>Business performance overview</p>
        </div>
        <div className={styles.dateChip}>Last 12 months</div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total Revenue" value="$94,200" trend="12% vs last month" trendUp icon={<DollarSign size={20} strokeWidth={1.8} />} />
        <StatCard label="Total Sales" value="3,842" trend="8% vs last month" trendUp icon={<TrendingUp size={20} strokeWidth={1.8} />} />
        <StatCard label="Total Customers" value="12,491" trend="5% vs last month" trendUp icon={<Users size={20} strokeWidth={1.8} />} />
        <StatCard label="Total Orders" value="1,203" trend="3% vs last month" trendUp icon={<ShoppingCart size={20} strokeWidth={1.8} />} />
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Revenue vs Expenses</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: '1px solid #e8eaf0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="url(#rev)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#exp)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Sales by Region</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={salesByRegion} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {salesByRegion.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 8, border: '1px solid #e8eaf0' }} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <h3>Top Products by Sales</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="product" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={80} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaf0' }} />
            <Bar dataKey="sales" fill="#4f46e5" radius={[0, 6, 6, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
