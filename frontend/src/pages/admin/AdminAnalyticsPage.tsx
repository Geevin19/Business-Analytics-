import AdminPageShell from '@/components/admin/AdminPageShell'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { monthlyGrowth, regionalPerformance, productPerformance } from '@/data/adminMockData'
import s from '@/components/admin/admin.module.css'

const COLORS = ['#166D16', '#06b6d4', '#10b981', '#f59e0b', '#1d7a1d']

const tabs = ['Revenue', 'Sales', 'Customers', 'Products', 'Inventory', 'Growth', 'Regional']

export default function AdminAnalyticsPage() {
  return (
    <AdminPageShell title="Analytics" subtitle="Revenue, sales, customer, product, inventory and regional insights">
      <div className={s.tabs}>
        {tabs.map(t => (
          <button key={t} className={`${s.tab} ${t === 'Revenue' ? s.tabActive : ''}`}>{t}</button>
        ))}
      </div>

      <div className={s.chartsRow}>
        <div className={s.card}>
          <div className={s.cardTitle}>Revenue Analytics (Area)</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#166D16" fill="rgba(79,70,229,0.12)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Sales Analytics (Bar)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="sales" fill="#166D16" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={s.chartsRow}>
        <div className={s.card}>
          <div className={s.cardTitle}>Customer Growth (Line)</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Regional Performance (Pie)</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={regionalPerformance} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="region" paddingAngle={3}>
                {regionalPerformance.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Product Performance Graph</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={productPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="sales" fill="#1d7a1d" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminPageShell>
  )
}
