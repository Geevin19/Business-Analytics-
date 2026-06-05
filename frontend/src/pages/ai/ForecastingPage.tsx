import PageShell from '@/components/ui/PageShell'
import { TrendingUp, Target, BarChart2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'

const C = { card: { background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #e8eaf0' } }
const ttip = { contentStyle: { borderRadius: 8, border: '1px solid #e8eaf0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }
const axis = { axisLine: false, tickLine: false }

const data = [
  { month: 'Jan', actual: 42000 }, { month: 'Feb', actual: 48000 }, { month: 'Mar', actual: 55000 },
  { month: 'Apr', actual: 51000 }, { month: 'May', actual: 63000 }, { month: 'Jun', actual: 71000 },
  { month: 'Jul', actual: 68000 }, { month: 'Aug', actual: 78000 }, { month: 'Sep', actual: 82000 },
  { month: 'Oct', actual: 90000, forecast: 90000 }, { month: 'Nov', forecast: 96000 },
  { month: 'Dec', forecast: 103000 }, { month: 'Jan+1', forecast: 108000 }, { month: 'Feb+1', forecast: 115000 },
]

const summaryCards = [
  { label: 'Predicted Revenue (Next Month)', value: '$103,000', icon: <TrendingUp size={20} strokeWidth={1.8} /> },
  { label: 'Forecast Accuracy', value: '94.2%', icon: <Target size={20} strokeWidth={1.8} /> },
  { label: 'Growth Projection (Q1)', value: '+16%', icon: <BarChart2 size={20} strokeWidth={1.8} /> },
]

export default function ForecastingPage() {
  return (
    <PageShell title="AI Sales Forecasting" subtitle="Revenue predictions based on historical trends.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ ...C.card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={C.card}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>Revenue Forecast</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>Solid = actual · Dashed = AI forecast</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <Tooltip {...ttip} formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend iconType="circle" iconSize={8} />
            <ReferenceLine x="Oct" stroke="#c7d2fe" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke="#818cf8" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
