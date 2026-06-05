import PageShell from '@/components/ui/PageShell'

const recs = [
  { icon: '💡', title: 'Upsell Premium Plan', desc: '234 customers match the profile for premium upgrade. Expected revenue lift: $12,400/month.', priority: 'high' },
  { icon: '🎯', title: 'Re-engage Dormant Customers', desc: '890 customers haven\'t purchased in 60+ days. Send targeted email campaign.', priority: 'high' },
  { icon: '📦', title: 'Restock Widget B & D', desc: 'Based on demand trends, both items will be out of stock within 14 days.', priority: 'medium' },
  { icon: '💰', title: 'Reduce Marketing Spend in Region West', desc: 'ROI in West region is 40% below average. Reallocate $8,000 to North region.', priority: 'medium' },
  { icon: '📊', title: 'Launch Weekend Flash Sale', desc: 'Historical data shows 38% higher conversion on weekends. Run a 48hr promo.', priority: 'low' },
  { icon: '🔔', title: 'Set Revenue Alert', desc: 'You\'re tracking 8% above target. Set a $100k milestone notification.', priority: 'low' },
]

const colors: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

export default function RecommendationsPage() {
  return (
    <PageShell title="AI Recommendation Engine" subtitle="Smart, data-driven recommendations to grow your business.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
        {recs.map(r => (
          <div key={r.title} style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderTop: `4px solid ${colors[r.priority]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.title}</div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: colors[r.priority] }}>
                  {r.priority} priority
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{r.desc}</p>
            <button style={{ marginTop: '1rem', padding: '0.45rem 1rem', background: 'transparent', border: `1.5px solid ${colors[r.priority]}`, color: colors[r.priority], borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
              Take Action
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
