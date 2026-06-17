import { useState } from 'react'
import {
  DollarSign, Users, ShoppingCart,
  ArrowUpRight, Activity, BarChart3,
  CheckCircle2, Clock, MoreHorizontal, Filter
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import styles from './DashboardPage.module.css'

/* ── Mock / sample data ── */
const revenueData = [
  { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
  { month: 'Feb', revenue: 48000, expenses: 30000, profit: 18000 },
  { month: 'Mar', revenue: 55000, expenses: 32000, profit: 23000 },
  { month: 'Apr', revenue: 51000, expenses: 29000, profit: 22000 },
  { month: 'May', revenue: 63000, expenses: 35000, profit: 28000 },
  { month: 'Jun', revenue: 71000, expenses: 38000, profit: 33000 },
  { month: 'Jul', revenue: 68000, expenses: 36000, profit: 32000 },
  { month: 'Aug', revenue: 78000, expenses: 40000, profit: 38000 },
  { month: 'Sep', revenue: 82000, expenses: 42000, profit: 40000 },
  { month: 'Oct', revenue: 90000, expenses: 45000, profit: 45000 },
  { month: 'Nov', revenue: 87000, expenses: 43000, profit: 44000 },
  { month: 'Dec', revenue: 94200, expenses: 48000, profit: 46200 },
]

const salesByRegion = [
  { name: 'North America', value: 35 },
  { name: 'Europe', value: 22 },
  { name: 'Asia Pacific', value: 28 },
  { name: 'Rest of World', value: 15 },
]

const CHART_COLORS = ['#16a34a', '#22c55e', '#10b981', '#059669', '#047857']

const expenseCategories = [
  { name: 'Marketing', value: 35 },
  { name: 'Operations', value: 25 },
  { name: 'Software', value: 20 },
  { name: 'HR & Payroll', value: 12 },
  { name: 'Other', value: 8 },
]

const EXPENSE_COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b']

const topProducts = [
  { product: 'Analytics Pro', sales: 4200, growth: 12 },
  { product: 'Data Suite', sales: 3800, growth: 8 },
  { product: 'AI Insights', sales: 3100, growth: 15 },
  { product: 'Report Hub', sales: 2700, growth: -3 },
  { product: 'Cloud Sync', sales: 2200, growth: 5 },
]

const recentTransactions = [
  { id: '#INV-001', customer: 'Acme Corp', amount: 4990, status: 'Completed', date: '2 min ago' },
  { id: '#INV-002', customer: 'TechFlow Inc', amount: 2990, status: 'Completed', date: '15 min ago' },
  { id: '#INV-003', customer: 'Global Retail', amount: 1490, status: 'Pending', date: '1 hr ago' },
  { id: '#INV-004', customer: 'StartUp Labs', amount: 3240, status: 'Processing', date: '2 hr ago' },
  { id: '#INV-005', customer: 'Nova Corp', amount: 2100, status: 'Completed', date: '3 hr ago' },
]

/* ── Component ── */
export default function DashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('12m')

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Real-time business performance overview</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.periodToggle}>
            <button
              className={`${styles.periodBtn} ${period === '7d' ? styles.active : ''}`}
              onClick={() => setPeriod('7d')}
            >7d</button>
            <button
              className={`${styles.periodBtn} ${period === '30d' ? styles.active : ''}`}
              onClick={() => setPeriod('30d')}
            >30d</button>
            <button
              className={`${styles.periodBtn} ${period === '12m' ? styles.active : ''}`}
              onClick={() => setPeriod('12m')}
            >12m</button>
          </div>
          <button className={styles.filterBtn}>
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <DollarSign size={18} strokeWidth={2} />
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiLabel}>Total Revenue</span>
            <span className={styles.kpiValue}>$94,200</span>
            <span className={styles.kpiChange}>
              <ArrowUpRight size={12} />
              12.3%
            </span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#dbeafe', color: '#2563eb' }}>
            <ShoppingCart size={18} strokeWidth={2} />
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiLabel}>Total Orders</span>
            <span className={styles.kpiValue}>1,203</span>
            <span className={styles.kpiChange}>
              <ArrowUpRight size={12} />
              8.7%
            </span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <Users size={18} strokeWidth={2} />
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiLabel}>Customers</span>
            <span className={styles.kpiValue}>12,491</span>
            <span className={styles.kpiChange}>
              <ArrowUpRight size={12} />
              5.2%
            </span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#fce7f3', color: '#db2777' }}>
            <BarChart3 size={18} strokeWidth={2} />
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiLabel}>Profit Margin</span>
            <span className={styles.kpiValue}>49.0%</span>
            <span className={styles.kpiChange}>
              <ArrowUpRight size={12} />
              2.1%
            </span>
          </div>
        </div>
      </div>

      {/* ── Charts Row 1 ── */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Revenue vs Expenses</h3>
            <div className={styles.cardActions}>
              <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString()}`}
                contentStyle={{
                  borderRadius: 8, border: '1px solid #e8eaf0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: 13,
                }}
              />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#rev)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#exp)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Sales by Region</h3>
            <div className={styles.cardActions}>
              <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={salesByRegion}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                dataKey="value"
                paddingAngle={4}
              >
                {salesByRegion.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{ borderRadius: 8, border: '1px solid #e8eaf0', fontSize: 13 }}
              />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Expense Breakdown</h3>
            <div className={styles.cardActions}>
              <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {expenseCategories.map((_, i) => (
                  <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{ borderRadius: 8, border: '1px solid #e8eaf0', fontSize: 13 }}
              />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Top Products by Sales</h3>
            <div className={styles.cardActions}>
              <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="product"
                type="category"
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={90}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaf0', fontSize: 13 }} />
              <Bar dataKey="sales" fill="#16a34a" radius={[0, 6, 6, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row: Recent Transactions ── */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <h3>Recent Transactions</h3>
          <div className={styles.cardActions}>
            <button className={styles.viewAll}>View All</button>
          </div>
        </div>
        <div className={styles.transactionTable}>
          <div className={styles.tableHeader}>
            <span>Invoice</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Time</span>
          </div>
          {recentTransactions.map((tx, i) => (
            <div key={i} className={styles.tableRow}>
              <span className={styles.invoiceId}>{tx.id}</span>
              <span className={styles.customerName}>{tx.customer}</span>
              <span className={styles.amount}>${tx.amount.toLocaleString()}</span>
              <span className={`${styles.status} ${styles[tx.status.toLowerCase()]}`}>
                {tx.status === 'Completed' && <CheckCircle2 size={12} />}
                {tx.status === 'Pending' && <Clock size={12} />}
                {tx.status === 'Processing' && <Activity size={12} />}
                {tx.status}
              </span>
              <span className={styles.date}>{tx.date}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}