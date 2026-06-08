import AdminPageShell from '@/components/admin/AdminPageShell'
import StatCard from '@/components/ui/StatCard'
import {
  DollarSign, TrendingUp, Users, UserCircle, Package, ShoppingCart, BarChart3,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { adminKpis, recentActivities, monthlyGrowth, regionalPerformance } from '@/data/adminMockData'
import s from '@/components/admin/admin.module.css'

const COLORS = ['#166D16', '#06b6d4', '#10b981', '#f59e0b']

export default function AdminHomePage() {
  return (
    <AdminPageShell title="Admin Dashboard" subtitle="Full administrative control and business overview">
      <div className={s.statsGrid}>
        <StatCard label="Total Revenue" value={adminKpis.revenue} trend="+18%" trendUp icon={<DollarSign size={20} />} />
        <StatCard label="Total Sales" value={adminKpis.sales} trend="+12%" trendUp icon={<TrendingUp size={20} />} />
        <StatCard label="Total Customers" value={adminKpis.customers} trend="+9%" trendUp icon={<Users size={20} />} />
        <StatCard label="Total Users" value={adminKpis.users} trend="+4%" trendUp icon={<UserCircle size={20} />} />
        <StatCard label="Total Products" value={adminKpis.products} trend="+2%" trendUp icon={<Package size={20} />} />
        <StatCard label="Total Orders" value={adminKpis.orders} trend="+11%" trendUp icon={<ShoppingCart size={20} />} />
        <StatCard label="Profit & Loss" value={adminKpis.profitLoss} trend="Positive" trendUp icon={<BarChart3 size={20} />} />
      </div>

      <div className={s.chartsRow}>
        <div className={s.card}>
          <div className={s.cardTitle}>Revenue Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#166D16" fill="rgba(79,70,229,0.15)" strokeWidth={2} name="Revenue ($K)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Customer Growth</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="customers" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="Customers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={s.grid2}>
        <div className={s.card}>
          <div className={s.cardTitle}>Recent Activities</div>
          <div className={s.activityList}>
            {recentActivities.map(a => (
              <div key={a.id} className={s.activityItem}>
                <span>{a.text}</span>
                <span className={s.activityTime}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Regional Performance</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={regionalPerformance} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" nameKey="region" paddingAngle={3}>
                {regionalPerformance.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Monthly Sales Overview</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
            <Bar dataKey="sales" fill="#166D16" radius={[4, 4, 0, 0]} name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminPageShell>
  )
}
