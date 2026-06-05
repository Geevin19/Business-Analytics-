import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const cpu = Array.from({ length: 20 }, (_, i) => ({ t: `${i}s`, value: Math.floor(Math.random() * 40 + 20) }))
const mem = Array.from({ length: 20 }, (_, i) => ({ t: `${i}s`, value: Math.floor(Math.random() * 30 + 50) }))

export default function AdminMonitorPage() {
  return (
    <PageShell title="System Monitor" subtitle="Real-time server performance and infrastructure health.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="CPU Usage" value="34%" trend="2%" trendUp={false} icon="🖥️" color="#6c63ff" />
        <StatCard label="Memory Usage" value="68%" trend="5%" trendUp icon="💾" color="#f59e0b" />
        <StatCard label="API Uptime" value="99.98%" icon="✅" color="#10b981" />
        <StatCard label="Active Sessions" value="284" trend="12%" trendUp icon="🔗" color="#3b82f6" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[{ title: 'CPU Usage (Live)', data: cpu, color: '#6c63ff' }, { title: 'Memory Usage (Live)', data: mem, color: '#f59e0b' }].map(chart => (
          <div key={chart.title} style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>{chart.title}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
