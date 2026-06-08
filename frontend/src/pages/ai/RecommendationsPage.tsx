import PageShell from '@/components/ui/PageShell'

const recs = [
  { title: 'Upsell Premium Plan', desc: '234 customers match the profile for premium upgrade. Expected revenue lift: $12,400/month.', priority: 'High' },
  { title: 'Re-engage Dormant Customers', desc: '890 customers have not purchased in 60+ days. A targeted email campaign is recommended.', priority: 'High' },
  { title: 'Restock Widget B and D', desc: 'Based on demand trends, both items will be out of stock within 14 days.', priority: 'Medium' },
  { title: 'Reduce Marketing Spend in Region West', desc: 'ROI in West region is 40% below average. Reallocate $8,000 to North region.', priority: 'Medium' },
  { title: 'Launch Weekend Flash Sale', desc: 'Historical data shows 38% higher conversion on weekends. Consider a 48-hour promotion.', priority: 'Low' },
  { title: 'Set Revenue Milestone Alert', desc: 'Revenue is tracking 8% above target. Set a $100k milestone notification.', priority: 'Low' },
]

const priority: Record<string, { bg: string; color: string }> = {
  High: { bg: '#fef2f2', color: '#dc2626' },
  Medium: { bg: '#fffbeb', color: '#d97706' },
  Low: { bg: '#f0fdf4', color: '#16a34a' },
}

export default function RecommendationsPage() {
  return (
    <PageShell title="AI Recommendation Engine" subtitle="Data-driven recommendations to grow your business.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
        {recs.map(r => (
          <div key={r.title} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #e8eaf0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.3 }}>{r.title}</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 4, background: priority[r.priority].bg, color: priority[r.priority].color, flexShrink: 0, marginLeft: '0.75rem' }}>
                {r.priority}
              </span>
            </div>
            <p style={{ fontSize: '0.845rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
            <button style={{ marginTop: '1rem', padding: '0.4rem 0.875rem', background: 'transparent', border: '1px solid #e8eaf0', color: '#166D16', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              Take Action
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
