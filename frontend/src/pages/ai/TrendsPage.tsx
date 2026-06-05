import PageShell from '@/components/ui/PageShell'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const trends = [
  { week: 'W1', mobile: 420, desktop: 380, tablet: 120 },
  { week: 'W2', mobile: 480, desktop: 360, tablet: 130 },
  { week: 'W3', mobile: 510, desktop: 340, tablet: 140 },
  { week: 'W4', mobile: 560, desktop: 320, tablet: 150 },
  { week: 'W5', mobile: 600, desktop: 300, tablet: 145 },
  { week: 'W6', mobile: 650, desktop: 290, tablet: 155 },
]

const insights = [
  { icon: '📱', text: 'Mobile usage growing 12% week-over-week', sentiment: 'positive' },
  { icon: '🖥️', text: 'Desktop sessions declining — optimize mobile UX', sentiment: 'warning' },
  { icon: '📈', text: 'Peak activity on Tuesday & Thursday afternoons', sentiment: 'positive' },
  { icon: '🛒', text: 'Cart abandonment up 4% — review checkout flow', sentiment: 'negative' },
]

export default function TrendsPage() {
  return (
    <PageShell title="AI Trend Prediction" subtitle="Identify emerging patterns and behavioral trends in your business data.">
      <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Device Usage Trends</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trends}>
            <defs>
              {['#6c63ff','#10b981','#f59e0b'].map((c, i) => (
                <linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="mobile" stroke="#6c63ff" fill="url(#g0)" strokeWidth={2} name="Mobile" />
            <Area type="monotone" dataKey="desktop" stroke="#10b981" fill="url(#g1)" strokeWidth={2} name="Desktop" />
            <Area type="monotone" dataKey="tablet" stroke="#f59e0b" fill="url(#g2)" strokeWidth={2} name="Tablet" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🤖 AI-Detected Insights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem' }}>
          {insights.map(i => (
            <div key={i.text} style={{ background: '#fff', borderRadius: 12, padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${i.sentiment === 'positive' ? '#10b981' : i.sentiment === 'warning' ? '#f59e0b' : '#ef4444'}` }}>
              <span style={{ fontSize: '1.4rem' }}>{i.icon}</span>
              <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{i.text}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
