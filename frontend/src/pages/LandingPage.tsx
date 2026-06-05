import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

const features = [
  { icon: '📊', title: 'Dashboard Overview', desc: 'Real-time KPIs — revenue, sales, orders & profit at a glance.' },
  { icon: '📈', title: 'Sales Analytics', desc: 'Daily to yearly reports with product & region breakdowns.' },
  { icon: '👥', title: 'Customer Analytics', desc: 'Segmentation, retention analysis & purchase behavior tracking.' },
  { icon: '💰', title: 'Financial Analytics', desc: 'Revenue, expenses, profit analysis & cash flow monitoring.' },
  { icon: '📦', title: 'Inventory Analytics', desc: 'Stock monitoring, low stock alerts & turnover analysis.' },
  { icon: '🤖', title: 'AI-Powered Insights', desc: 'Forecasting, trend prediction & smart recommendation engine.' },
  { icon: '📋', title: 'Reporting Module', desc: 'Generate, export PDF/Excel & schedule automated reports.' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'Email alerts, push notifications & business performance alerts.' },
  { icon: '🔐', title: 'Security & RBAC', desc: 'JWT auth, role-based access control & full audit logging.' },
]

const stats = [
  { value: '15+', label: 'Feature Modules' },
  { value: '50+', label: 'Chart Types' },
  { value: 'Real-Time', label: 'Live Data' },
  { value: 'AI', label: 'Powered' },
]

const brands = ['Accenture', 'Deloitte', 'PwC', 'McKinsey', 'KPMG', 'EY']

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navIcon}>⚡</span>
          <span>BizAnalytics</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#stats">Stats</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className={styles.navActions}>
          <Link to="/auth/login" className={styles.btnOutline}>Sign In</Link>
          <Link to="/auth/register" className={styles.btnPrimary}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>🚀 All-in-One Business Platform</div>
        <h1 className={styles.heroTitle}>
          One Dashboard To Manage<br />
          Your Entire <span className={styles.heroAccent}>Business.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          From revenue tracking to AI-driven forecasting — manage every aspect
          of your business analytics in one powerful platform.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/auth/register" className={styles.btnPrimary}>Get Started Free</Link>
          <Link to="/auth/login" className={styles.btnGhost}>▶ Watch Demo</Link>
        </div>

        {/* Mock dashboard preview */}
        <div className={styles.heroPreview}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewDot} style={{ background: '#ef4444' }} />
              <span className={styles.previewDot} style={{ background: '#f59e0b' }} />
              <span className={styles.previewDot} style={{ background: '#10b981' }} />
              <span className={styles.previewTitle}>Dashboard — Welcome back 👋</span>
            </div>
            <div className={styles.previewMetrics}>
              {[
                { label: 'Revenue', value: '$94,200', color: '#10b981', trend: '+12%' },
                { label: 'Sales', value: '3,842', color: '#6c63ff', trend: '+8%' },
                { label: 'Customers', value: '12,491', color: '#f59e0b', trend: '+5%' },
                { label: 'Orders', value: '1,203', color: '#3b82f6', trend: '+3%' },
              ].map(m => (
                <div key={m.label} className={styles.metric}>
                  <div className={styles.metricLabel}>{m.label}</div>
                  <div className={styles.metricValue} style={{ color: m.color }}>{m.value}</div>
                  <div className={styles.metricTrend}>{m.trend}</div>
                </div>
              ))}
            </div>
            <div className={styles.previewChart}>
              {[40, 65, 45, 80, 60, 90, 75, 95, 70, 85, 78, 92].map((h, i) => (
                <div
                  key={i}
                  className={styles.bar}
                  style={{ height: `${h}%`, opacity: 0.6 + (i / 20) }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className={styles.partners}>
        <p className={styles.partnersLabel}>Trusted by 150+ enterprises</p>
        <div className={styles.brandsList}>
          {brands.map(b => <span key={b} className={styles.brandItem}>{b}</span>)}
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection} id="stats">
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Problem section */}
      <section className={styles.problemSection}>
        <div className={styles.sectionBadge}>Business Struggles</div>
        <h2 className={styles.sectionTitle}>Running a business shouldn't<br />be this complicated.</h2>
        <p className={styles.sectionSubtitle}>
          Juggling multiple tools, missed insights, and unclear performance data — we solve all of it.
        </p>
        <div className={styles.problemGrid}>
          {[
            { icon: '🔀', title: 'Multiple disconnected tools', desc: 'Too many platforms for invoices, analytics, and finance management.' },
            { icon: '⏰', title: 'Missed payments & delays', desc: 'Manual tracking leads to follow-up failures and cash flow issues.' },
            { icon: '📉', title: 'No clear business overview', desc: 'Key insights are scattered, making data-driven decisions impossible.' },
          ].map(p => (
            <div key={p.title} className={styles.problemCard}>
              <div className={styles.problemIcon}>{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.sectionBadge}>Everything Included</div>
        <h2 className={styles.sectionTitle}>Everything your business<br />needs in one place.</h2>
        <div className={styles.featuresGrid}>
          {features.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2>Ready to transform your business?</h2>
        <p>Join thousands of businesses already using BizAnalytics to drive growth.</p>
        <Link to="/auth/register" className={styles.btnPrimary}>Get Started Free</Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span>⚡</span> BizAnalytics
        </div>
        <p>© 2026 BizAnalytics. All rights reserved.</p>
      </footer>
    </div>
  )
}
