import PageShell from '@/components/ui/PageShell'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const C = { card: { background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #e8eaf0' } }
const ttip = { contentStyle: { borderRadius: 8, border: '1px solid #e8eaf0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }
const axis = { axisLine: false, tickLine: false }

const trends = [
  { week: 'W1', mobile: 420, desktop: 380, tablet: 120 },
  { week: 'W2', mobile: 480, desktop: 360, tablet: 130 },
  { week: 'W3', mobile: 510, desktop: 340, tablet: 140 },
  { week: 'W4', mobile: 560, desktop: 320, tablet: 150 },
  { week: 'W5', mobile: 600, desktop: 300, tablet: 145 },
  { week: 'W6', mobile: 650, desktop: 290, tablet: 155 },
]

const insights = [
  { text: 'Mobile usage growing 12% week-over-week', positive: true },
  { text: 'Desktop sessions declining — consider mobile-first UX improvements', positive: false },
  { text: 'Peak activity on Tuesday and Thursday afternoons', positive: true },
  { text: 'Cart abandonment up 4% — review checkout flow', positive: false },
]

export default function TrendsPage() {
  return (
    <PageShell title="AI Trend Prediction" subtitle="Emerging patterns and behavioral trends in your data.">
      <div style={C.card}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>Device Usage Trends</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trends}>
            <defs>
              {[['#4f46e5', 'g0'], ['#818cf8', 'g1'], ['#c7d2fe', 'g2']].map(([c, id]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} {...axis} />
            <Tooltip {...ttip} />
            <Legend iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="mobile" stroke="#4f46e5" fill="url(#g0)" strokeWidth={2} name="Mobile" />
            <Area type="monotone" dataKey="desktop" stroke="#818cf8" fill="url(#g1)" strokeWidth={2} name="Desktop" />
            <Area type="monotone" dataKey="tablet" stroke="#c7d2fe" fill="url(#g2)" strokeWidth={2} name="Tablet" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={C.card}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>AI-Detected Insights</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {insights.map(i => (
            <div key={i.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 8, borderLeft: `3px solid ${i.positive ? '#4f46e5' : '#94a3b8'}` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: i.positive ? '#4f46e5' : '#94a3b8', flexShrink: 0 }} />
              <span style={{ fontSize: '0.855rem', color: '#374151', lineHeight: 1.5 }}>{i.text}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
