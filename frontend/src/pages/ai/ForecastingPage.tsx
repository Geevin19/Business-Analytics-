import PageShell from '@/components/ui/PageShell'
import { TrendingUp, Target, BarChart2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import s from '@/styles/shared.module.css'

const axis = { axisLine: false as const, tickLine: false as const }
const ttip = { contentStyle: { borderRadius: 8, fontSize: 12 } }

const data = [
  { month: 'Jan', actual: 42000 }, { month: 'Feb', actual: 48000 }, { month: 'Mar', actual: 55000 },
  { month: 'Apr', actual: 51000 }, { month: 'May', actual: 63000 }, { month: 'Jun', actual: 71000 },
  { month: 'Jul', actual: 68000 }, { month: 'Aug', actual: 78000 }, { month: 'Sep', actual: 82000 },
  { month: 'Oct', actual: 90000, forecast: 90000 }, { month: 'Nov', forecast: 96000 },
  { month: 'Dec', forecast: 103000 }, { month: 'Jan+1', forecast: 108000 }, { month: 'Feb+1', forecast: 115000 },
]

const summaryCards = [
  { label: 'Next Month Forecast', value: '$103,000', icon: <TrendingUp size={20} strokeWidth={1.8} /> },
  { label: 'Forecast Accuracy', value: '94.2%', icon: <Target size={20} strokeWidth={1.8} /> },
  { label: 'Q1 Growth Projection', value: '+16%', icon: <BarChart2 size={20} strokeWidth={1.8} /> },
]

export default function ForecastingPage() {
  return (
    <PageShell title="AI Sales Forecasting" subtitle="Revenue predictions based on historical trends.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        {summaryCards.map(sc => (
          <div key={sc.label} className={s.card} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              {sc.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{sc.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{sc.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.card}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div className={s.cardTitle} style={{ marginBottom: '0.2rem' }}>Revenue Forecast</div>
          <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>Solid line = actual · Dashed line = AI forecast</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} {...axis} />
            <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend iconType="circle" iconSize={8} />
            <ReferenceLine x="Oct" stroke="var(--border)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="actual" stroke="#166D16" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke="#1a8a1a" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
