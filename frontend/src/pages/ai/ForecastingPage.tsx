import PageShell from '@/components/ui/PageShell'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'

const data = [
  { month: 'Jan', actual: 42000 }, { month: 'Feb', actual: 48000 }, { month: 'Mar', actual: 55000 },
  { month: 'Apr', actual: 51000 }, { month: 'May', actual: 63000 }, { month: 'Jun', actual: 71000 },
  { month: 'Jul', actual: 68000 }, { month: 'Aug', actual: 78000 }, { month: 'Sep', actual: 82000 },
  { month: 'Oct', actual: 90000, forecast: 90000 }, { month: 'Nov', forecast: 96000 },
  { month: 'Dec', forecast: 103000 }, { month: 'Jan+1', forecast: 108000 }, { month: 'Feb+1', forecast: 115000 },
]

export default function ForecastingPage() {
  return (
    <PageShell title="AI Sales Forecasting" subtitle="Machine learning-powered revenue predictions based on historical trends.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        {[
          { label: 'Predicted Revenue (Next Month)', value: '$103,000', icon: '🤖' },
          { label: 'Forecast Accuracy', value: '94.2%', icon: '🎯' },
          { label: 'Growth Projection (Q1)', value: '+16%', icon: '📈' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6c63ff' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Revenue Forecast</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Solid line = actual data · Dashed line = AI forecast</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend />
            <ReferenceLine x="Oct" stroke="#6c63ff" strokeDasharray="4 4" label={{ value: 'Forecast Start', fill: '#6c63ff', fontSize: 11 }} />
            <Line type="monotone" dataKey="actual" stroke="#6c63ff" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" dot={false} name="AI Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PageShell>
  )
}
