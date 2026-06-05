import PageShell from '@/components/ui/PageShell'
import StatCard from '@/components/ui/StatCard'
import { Cpu, Server, Activity, Users } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const cpu = Array.from({ length: 20 }, (_, i) => ({ t: `${i}s`, value: Math.floor(Math.random() * 40 + 20) }))
const mem = Array.from({ length: 20 }, (_, i) => ({ t: `${i}s`, value: Math.floor(Math.random() * 30 + 50) }))

const C = { card: { background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #e8eaf0' } }
const ttip = { contentStyle: { borderRadius: 8, border: '1px solid #e8eaf0' } }
const axis = { axisLine: false, tickLine: false }

export default function AdminMonitorPage() {
  return (
    <PageShell title="System Monitor" subtitle="Server performance and infrastructure health.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        <StatCard label="CPU Usage" value="34%" trend="2% decrease" trendUp={false} icon={<Cpu size={20} strokeWidth={1.8} />} />
        <StatCard label="Memory Usage" value="68%" trend="5% increase" trendUp={false} icon={<Server size={20} strokeWidth={1.8} />} />
        <StatCard label="API Uptime" value="99.98%" icon={<Activity size={20} strokeWidth={1.8} />} />
        <StatCard label="Active Sessions" value="284" trend="12% increase" trendUp icon={<Users size={20} strokeWidth={1.8} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[
          { title: 'CPU Usage', data: cpu, color: '#4f46e5' },
          { title: 'Memory Usage', data: mem, color: '#818cf8' },
        ].map(chart => (
          <div key={chart.title} style={C.card}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>{chart.title}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#94a3b8' }} {...axis} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" {...axis} />
                <Tooltip {...ttip} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
