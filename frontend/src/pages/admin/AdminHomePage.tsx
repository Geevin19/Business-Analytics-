import AdminPageShell from '@/components/admin/AdminPageShell'
import StatCard from '@/components/ui/StatCard'
import {
  DollarSign, TrendingUp, Users, UserCircle, Package, ShoppingCart, BarChart3,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useEffect, useState } from 'react'
import { getAnalyticsOverview, getDashboard } from '@/services/admin.service'
import s from '@/components/admin/admin.module.css'

const COLORS = ['#166D16', '#06b6d4', '#10b981', '#f59e0b']

export default function AdminHomePage() {
  const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([])
  const [regionalPerformance, setRegionalPerformance] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>({})

  useEffect(() => {
    let mounted = true
    Promise.all([getAnalyticsOverview().catch(() => null), getDashboard().catch(() => null)]).then(([a, db]: any) => {
      if (!mounted) return
      if (a) {
        setMonthlyGrowth(a.monthlyGrowth || [])
        setRegionalPerformance(a.regionalPerformance || [])
        setRecentActivities(a.recentActivities?.map((r: any) => ({ id: r.created_at, text: `${r.user_email}: ${r.action}`, time: new Date(r.created_at).toLocaleString() })) || [])
      }
      if (db) {
        setKpis(db)
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <AdminPageShell title="Admin Dashboard" subtitle="Full administrative control and business overview">
      <div className={s.statsGrid}>
        <StatCard label="Revenue (K)" value={kpis.totalRevenue ? '$' + Math.round(kpis.totalRevenue / 1000) + 'K' : '$0'} trendUp icon={<DollarSign size={20} />} />
        <StatCard label="Total Sales" value={kpis.totalSales ?? 0} trendUp icon={<TrendingUp size={20} />} />
        <StatCard label="Total Customers" value={kpis.totalCustomers ?? 0} trendUp icon={<Users size={20} />} />
        <StatCard label="Total Users" value={kpis.totalUsers ?? 0} trendUp icon={<UserCircle size={20} />} />
        <StatCard label="Total Products" value={kpis.totalProducts ?? 0} trendUp icon={<Package size={20} />} />
        <StatCard label="Total Orders" value={kpis.totalSales ?? 0} trendUp icon={<ShoppingCart size={20} />} />
        <StatCard label="Profit & Loss" value={(kpis.netProfit ?? 0) > 0 ? '+$' + Math.round(kpis.netProfit) : '$0'} trendUp icon={<BarChart3 size={20} />} />
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
            {recentActivities.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activities</p>}
            {recentActivities.map((a: any) => (
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
              <Tooltip formatter={(v: number) => `${v}`} />
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