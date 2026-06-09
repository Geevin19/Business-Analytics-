import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, BarChart3, LineChart, PieChart, Zap,
  Globe2, Download, Brain, TrendingUp, Users, DollarSign,
  Check, ChevronDown, Activity, FileText, Bell,
  RefreshCw, Lock, Cloud, Clock, Headphones, Database,
  Sun, Moon,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import s from './LandingPage.module.css'

// ── Exact replica of business-analytics-dashboard scene (Canvas 2D, no Three.js) ──
function ParticleCanvas({ isLight }: { isLight: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0

    // ── constants matching the original ──────────────────────────────────
    const particleColor = isLight ? '#ff0000' : '#ffffff'
    const COLORS = [particleColor, particleColor, particleColor, particleColor]
    const wireColor = isLight ? '#16a34a' : '#34d6d0'
    const GRID = 12
    const PER_COL = 5
    const COUNT = GRID * GRID * PER_COL   // 720

    // ── build all 5 shape arrays once ────────────────────────────────────
    const scatter = new Float32Array(COUNT * 3)
    const bars    = new Float32Array(COUNT * 3)
    const globe   = new Float32Array(COUNT * 3)
    const wave    = new Float32Array(COUNT * 3)
    const burst   = new Float32Array(COUNT * 3)
    const colors  = new Uint8Array(COUNT * 3)   // rgb 0-255

    const colHeight: number[] = []
    for (let c = 0; c < GRID * GRID; c++)
      colHeight[c] = 0.22 + Math.pow(Math.random(), 1.5) * 0.42

    const golden = Math.PI * (1 + Math.sqrt(5))

    function hex2rgb(h: string): [number,number,number] {
      const r = parseInt(h.slice(1,3),16)
      const g = parseInt(h.slice(3,5),16)
      const b = parseInt(h.slice(5,7),16)
      return [r,g,b]
    }

    for (let i = 0; i < COUNT; i++) {
      const sr = 6.5 + Math.random() * 3.5
      const st = Math.acos(2 * Math.random() - 1)
      const sp = Math.random() * Math.PI * 2
      scatter[i*3]   = sr * Math.sin(st) * Math.cos(sp)
      scatter[i*3+1] = sr * Math.sin(st) * Math.sin(sp) * 0.7
      scatter[i*3+2] = sr * Math.cos(st)

      const col    = Math.floor(i / PER_COL)
      const within = i % PER_COL
      const cx = col % GRID
      const cz = Math.floor(col / GRID)
      bars[i*3]   = (cx - (GRID-1)/2) * 0.55
      bars[i*3+1] = within * colHeight[col] - 1.2
      bars[i*3+2] = (cz - (GRID-1)/2) * 0.55

      const gy  = 1 - (i/(COUNT-1)) * 2
      const gr  = Math.sqrt(1 - gy*gy)
      const gth = golden * i
      globe[i*3]   = Math.cos(gth) * gr * 3.3
      globe[i*3+1] = gy * 3.3
      globe[i*3+2] = Math.sin(gth) * gr * 3.3

      const XN  = 36
      const gx2 = i % XN
      const gz2 = Math.floor(i / XN)
      const ZN  = Math.ceil(COUNT / XN)
      wave[i*3]   = (gx2/(XN-1)) * 9 - 4.5
      wave[i*3+1] = Math.sin(gx2*0.5)*0.4 + (gx2/XN)*3.4 - 1.4 + Math.sin(gz2*0.6)*0.2
      wave[i*3+2] = (gz2 - (ZN-1)/2) * 0.28

      const bx = Math.random()*2-1, by = Math.random()*2-1, bz = Math.random()*2-1
      const bl = Math.hypot(bx,by,bz) || 1
      const br = 8 + Math.random() * 7
      burst[i*3]   = (bx/bl)*br
      burst[i*3+1] = (by/bl)*br
      burst[i*3+2] = (bz/bl)*br

      const [r,g,b] = hex2rgb(COLORS[i % COLORS.length])
      colors[i*3]=r; colors[i*3+1]=g; colors[i*3+2]=b
    }

    const shapes: Record<string, Float32Array> = { scatter, bars, globe, wave, burst }

    // ── keyframes (identical to original) ────────────────────────────────
    const KEYS = [
      { p:0.00, s:'scatter'}, { p:0.06, s:'scatter'},
      { p:0.15, s:'bars'},    { p:0.23, s:'bars'},
      { p:0.31, s:'globe'},   { p:0.41, s:'globe'},
      { p:0.49, s:'wave'},    { p:0.59, s:'wave'},
      { p:0.79, s:'wave'},    { p:0.92, s:'burst'},
      { p:1.00, s:'burst'},
    ]

    function smoothstep(t: number) { return t*t*(3-2*t) }

    // ── working buffers ───────────────────────────────────────────────────
    const pos = new Float32Array(COUNT * 3)

    // ── scroll tracking ───────────────────────────────────────────────────
    let scrollP = 0
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollP = max > 0 ? window.scrollY / max : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── resize ────────────────────────────────────────────────────────────
    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── project 3D → 2D  (simple perspective, camera orbits like original) ──
    function project(x: number, y: number, z: number, camAngle: number, camY: number) {
      // rotate around Y axis
      const cosA = Math.cos(camAngle), sinA = Math.sin(camAngle)
      const rx =  cosA*x + sinA*z
      const ry =  y
      const rz = -sinA*x + cosA*z

      // camera at radius 11, looking at origin
      const camZ = 11
      const relZ = rz + camZ
      if (relZ < 0.5) return null

      const fov   = 0.85   // roughly fov=50 in three.js
      const scale = (canvas.height * fov) / relZ
      const sx    = canvas.width  / 2 + rx * scale
      const sy    = canvas.height / 2 - (ry - camY + 0.3) * scale
      return { sx, sy, scale, depth: relZ }
    }

    // ── draw one cube face as a small rect ────────────────────────────────
    function drawCube(sx: number, sy: number, scale: number,
                      r: number, g: number, b: number, depth: number) {
      const sz = Math.max(0.3, 0.032 * scale)
      const fog = Math.max(0, Math.min(1, 1 - (depth - 6) / 20))
      const alpha = fog * (isLight ? 0.75 : 0.85)
      if (alpha < 0.04) return

      ctx.save()
      ctx.globalAlpha = alpha

      // top face
      ctx.fillStyle = `rgb(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+60)})`
      ctx.fillRect(sx - sz, sy - sz * 1.4, sz * 2, sz * 0.7)

      // front face
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(sx - sz, sy - sz * 0.7, sz * 2, sz * 1.8)

      // right face (darker)
      ctx.fillStyle = `rgb(${Math.floor(r*0.6)},${Math.floor(g*0.6)},${Math.floor(b*0.6)})`
      ctx.fillRect(sx + sz, sy - sz * 1.4, sz * 0.7, sz * 2.1)

      ctx.restore()
    }

    // ── animation loop ────────────────────────────────────────────────────
    let rotY = 0
    let camY = 1.5
    let time = 0

    function draw() {
      raf = requestAnimationFrame(draw)
      time += 0.012

      const p = scrollP

      // find keyframe segment
      let k = 0
      for (let i = 0; i < KEYS.length - 1; i++) {
        if (p >= KEYS[i].p && p <= KEYS[i+1].p) { k = i; break }
        if (p > KEYS[KEYS.length-1].p) k = KEYS.length - 2
      }
      const seg  = KEYS[k]
      const next = KEYS[k+1]
      const local = (p - seg.p) / ((next.p - seg.p) || 1)
      const blend = smoothstep(Math.min(1, Math.max(0, local)))

      const fromArr = shapes[seg.s]
      const toArr   = shapes[next.s]
      const wobble  = seg.s === next.s ? 0.05 : 0

      for (let i = 0; i < COUNT; i++) {
        const fx = fromArr[i*3], fy = fromArr[i*3+1], fz = fromArr[i*3+2]
        const tx = toArr[i*3],   ty = toArr[i*3+1],   tz = toArr[i*3+2]
        pos[i*3]   = fx + (tx-fx)*blend
        pos[i*3+1] = fy + (ty-fy)*blend + (wobble ? Math.sin(time*1.5 + i*0.3)*wobble : 0)
        pos[i*3+2] = fz + (tz-fz)*blend
      }

      // camera orbit — matches original Rig
      const angle  = p * Math.PI * 0.7
      const radius = 11 - Math.sin(p * Math.PI) * 2.5
      const targetCamY = 1.5 + Math.sin(p * Math.PI) * 1.5
      camY += (targetCamY - camY) * 0.05

      // rotation speed — faster on globe section
      const spin = 0.003 + (p > 0.3 && p < 0.46 ? 0.012 : 0)
      rotY += spin

      const camAngle = angle + rotY * 0.15  // base orbit + continuous spin

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // collect projected points for depth sorting
      type Item = { sx:number; sy:number; scale:number; r:number; g:number; b:number; depth:number }
      const items: Item[] = []
      for (let i = 0; i < COUNT; i++) {
        const pr = project(pos[i*3], pos[i*3+1], pos[i*3+2], camAngle, camY)
        if (!pr) continue
        items.push({ ...pr, r: colors[i*3], g: colors[i*3+1], b: colors[i*3+2] })
      }
      // back-to-front (painter's algorithm)
      items.sort((a,b) => b.depth - a.depth)
      for (const it of items) drawCube(it.sx, it.sy, it.scale, it.r, it.g, it.b, it.depth)

      // wireframe core (icosahedron approximated as rotating circle)
      const burst2 = Math.max(0, (p - 0.82) / 0.18)
      const coreR  = (2.4 + burst2 * 9) * (canvas.height * 0.85 / 11)
      const coreA  = 0.12 * (1 - burst2)
      if (coreA > 0.01) {
        ctx.save()
        ctx.globalAlpha = coreA
        ctx.strokeStyle = wireColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(canvas.width/2, canvas.height/2, coreR, 0, Math.PI*2)
        ctx.stroke()
        for (let a = 0; a < 5; a++) {
          const ang = (a/5)*Math.PI*2 + time*0.1
          ctx.beginPath()
          ctx.moveTo(canvas.width/2, canvas.height/2)
          ctx.lineTo(canvas.width/2 + Math.cos(ang)*coreR, canvas.height/2 + Math.sin(ang)*coreR)
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
    }
  }, [isLight])

  return <canvas ref={ref} className={`${s.canvas} ${isLight ? s.canvasLight : ''}`} />
}

// ── Helpers ───────────────────────────────────────────────────────────────
const rv = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: 0.65, ease: 'easeOut' as const, delay },
})

function Badge({ children }: { children: string }) {
  return <span className={s.badge}><span className={s.badgeDot} />{children}</span>
}

// ── Mock Dashboard ────────────────────────────────────────────────────────
function DashboardMock() {
  return (
    <div className={s.mockWrap}>
      <div className={s.mock}>
        <div className={s.mockBar}>
          <span className={s.mockDot} style={{ background: '#ef4444' }} />
          <span className={s.mockDot} style={{ background: '#f59e0b' }} />
          <span className={s.mockDot} style={{ background: '#22c55e' }} />
          <span className={s.mockBarTitle}>Analytics Dashboard</span>
        </div>
        <div className={s.mockKpis}>
          {[{ l: 'Revenue', v: '$94.2K', up: true }, { l: 'Sales', v: '3,842', up: true }, { l: 'Customers', v: '12.4K', up: true }, { l: 'Growth', v: '+18%', up: true }].map(k => (
            <div key={k.l} className={s.mockKpi}>
              <div className={s.mockKpiLabel}>{k.l}</div>
              <div className={s.mockKpiValue}>{k.v}</div>
              <div className={s.mockKpiTrend}>▲ 12%</div>
            </div>
          ))}
        </div>
        <div className={s.mockCharts}>
          <div className={s.mockChart}>
            <div className={s.mockChartTitle}>Revenue Trend</div>
            <div className={s.mockBars}>
              {[40, 60, 45, 80, 65, 90, 75, 95, 70, 88, 78, 100].map((h, i) => (
                <div key={i} className={s.mockBarItem} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className={s.mockChart}>
            <div className={s.mockChartTitle}>Customer Growth</div>
            <svg viewBox="0 0 100 50" className={s.mockLine}>
              <polyline points="0,45 10,38 20,35 30,28 40,25 50,18 60,15 70,10 80,8 90,5 100,3" fill="none" stroke="rgba(22,163,74,0.8)" strokeWidth="2" />
              <polyline points="0,45 10,38 20,35 30,28 40,25 50,18 60,15 70,10 80,8 90,5 100,3 100,50 0,50" fill="rgba(22,163,74,0.15)" stroke="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────
const metrics = [
  { icon: DollarSign, label: 'Total Revenue', value: '$2.4M', change: '+18%' },
  { icon: TrendingUp, label: 'Total Sales', value: '48,291', change: '+12%' },
  { icon: Users, label: 'Active Customers', value: '12,491', change: '+9%' },
  { icon: BarChart3, label: 'Conversion Rate', value: '3.8%', change: '+0.4%' },
  { icon: PieChart, label: 'Profit Margin', value: '42.3%', change: '+2.1%' },
  { icon: Activity, label: 'Monthly Growth', value: '+18%', change: '+3%' },
]

const features = [
  { icon: Activity, title: 'Real-Time Analytics', desc: 'Live data streams updated every second for instant business insights.' },
  { icon: BarChart3, title: 'Interactive Dashboards', desc: 'Drag-and-drop widgets, custom layouts, and drill-down charts.' },
  { icon: FileText, title: 'Custom Reports', desc: 'Schedule PDF/Excel reports and deliver them to your inbox automatically.' },
  { icon: TrendingUp, title: 'Sales Tracking', desc: 'Monitor every sale, rep, region, and product in one unified view.' },
  { icon: Users, title: 'Customer Insights', desc: 'Segment, track retention, and predict churn before it happens.' },
  { icon: Brain, title: 'AI-Based Predictions', desc: 'Machine learning forecasts for revenue, demand, and risk.' },
  { icon: DollarSign, title: 'Financial Analytics', desc: 'P&L, cash flow, budgets, and expense tracking in real time.' },
  { icon: Download, title: 'Data Export & Sharing', desc: 'One-click export to PDF, Excel, CSV, or share via link.' },
]

const modules = [
  { icon: TrendingUp, title: 'Sales Analytics', color: '#16a34a' },
  { icon: Globe2, title: 'Marketing Analytics', color: '#15803d' },
  { icon: Users, title: 'Customer Analytics', color: '#22c55e' },
  { icon: Database, title: 'Inventory Analytics', color: '#10b981' },
  { icon: DollarSign, title: 'Financial Analytics', color: '#dc2626' },
  { icon: Activity, title: 'Performance Analytics', color: '#ef4444' },
]

const aiFeatures = [
  { title: 'Revenue Forecasting', desc: 'Predict next quarter revenue with 94% accuracy using ML models trained on your data.' },
  { title: 'Customer Churn Prediction', desc: 'Identify at-risk customers 30 days before they leave, enabling proactive retention.' },
  { title: 'Sales Opportunities', desc: 'AI scans your pipeline and surfaces the highest-value deals to close this week.' },
  { title: 'Business Risk Detection', desc: 'Automatic anomaly detection flags unusual patterns before they become problems.' },
  { title: 'Automated Reports', desc: 'AI writes narrative summaries of your KPIs delivered every Monday morning.' },
]

const reports = [
  { icon: FileText, title: 'PDF Reports', desc: 'Branded, boardroom-ready PDF reports generated in seconds.' },
  { icon: Download, title: 'Excel Export', desc: 'Full raw data export with pivot-ready formatting.' },
  { icon: Clock, title: 'Scheduled Reports', desc: 'Daily, weekly, or monthly auto-delivery to any email.' },
  { icon: Bell, title: 'Email Delivery', desc: 'Instant alerts when KPIs breach thresholds you define.' },
  { icon: BarChart3, title: 'Data Visualization', desc: 'Interactive charts embedded directly in your reports.' },
]



const plans = [
  { name: 'Starter', price: '$0', note: '/mo', features: ['5 dashboards', '10 data connectors', '7-day history', 'PDF export', 'Community support'], cta: 'Start free', featured: false },
  { name: 'Professional', price: '$49', note: '/seat/mo', features: ['Unlimited dashboards', '300+ connectors', 'ML forecasting', 'Scheduled reports', 'Priority support', 'SOC 2 reports'], cta: 'Start 14-day trial', featured: true },
  { name: 'Enterprise', price: 'Custom', note: '', features: ['Dedicated instance', 'SSO & SCIM', 'Custom SLAs', 'White-label', 'Solutions engineer', 'On-prem option'], cta: 'Talk to sales', featured: false },
]

const whyUs = [
  { icon: Zap, title: 'Fast Performance', desc: 'Sub-100ms query response on datasets up to 10B rows.' },
  { icon: Lock, title: 'Secure Data', desc: 'SOC 2 Type II, end-to-end encryption, GDPR compliant.' },
  { icon: Cloud, title: 'Cloud-Based', desc: 'No infrastructure to manage. Works everywhere, always.' },
  { icon: RefreshCw, title: 'Real-Time Updates', desc: 'Dashboards refresh automatically as new data arrives.' },
  { icon: Database, title: 'Easy Integration', desc: '300+ connectors: Salesforce, Shopify, Stripe, and more.' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated success team available around the clock.' },
]

const faqs = [
  { q: 'How do I set up my dashboard?', a: 'Connect your data source, choose a template, and your dashboard is live in under 5 minutes. No coding required.' },
  { q: 'Is my data secure?', a: 'Yes. We are SOC 2 Type II certified, use AES-256 encryption, and never share your data with third parties.' },
  { q: 'What integrations are supported?', a: 'We support 300+ integrations including Salesforce, HubSpot, Shopify, Stripe, Google Analytics, PostgreSQL, and more.' },
  { q: 'Can I change my plan later?', a: 'Absolutely. Upgrade or downgrade at any time. Changes take effect immediately with pro-rated billing.' },
  { q: 'How are reports generated?', a: 'Reports are generated on-demand or on a schedule you define. Export as PDF, Excel, or CSV in one click.' },
]

// ── Component ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className={s.page}>
      <ParticleCanvas isLight={isLight} />
      <div className={s.veil} />

      <div className={s.contentLayer}>
      {/* NAV */}
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className={s.nav}>
        <div className={s.navInner}>
          <div className={s.brand}>
            <div className={s.brandIcon}><Activity size={18} strokeWidth={2.5} /></div>
            <span className={s.brandName}>BizAnalytics</span>
          </div>
          <nav className={s.navLinks}>
            <a href="#features">Features</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#reports">Reports</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className={s.navActions}>
            <button
              type="button"
              className={s.themeToggle}
              onClick={toggleTheme}
              title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {isLight ? <Moon size={17} strokeWidth={1.8} /> : <Sun size={17} strokeWidth={1.8} />}
            </button>
            <Link to="/auth/login" className={s.navLogin}>Login</Link>
            <Link to="/auth/register" className={s.navCta}>Sign Up</Link>
          </div>
        </div>
      </motion.header>

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroGrid}>
          <div className={s.heroLeft}>
            <motion.div {...rv(0)}><Badge>Real-time Business Intelligence</Badge></motion.div>
            <motion.h1 {...rv(0.08)} className={s.heroTitle}>
              Transform Your Business Data Into <span className={s.heroAccent}>Actionable Insights</span>
            </motion.h1>
            <motion.p {...rv(0.15)} className={s.heroSub}>
              Monitor KPIs, track performance, predict trends, and make data-driven decisions with our powerful Business Analytics Dashboard.
            </motion.p>
            <motion.div {...rv(0.22)} className={s.heroCtas}>
              <Link to="/auth/register" className={s.btnPrimary}>Get Started <ArrowRight size={16} /></Link>
              <a href="#dashboard" className={s.btnGhost}>Watch Demo</a>
            </motion.div>
            <motion.div {...rv(0.3)} className={s.heroStats}>
              <div className={s.heroStat}><span className={s.heroStatVal}>4.2B+</span><span className={s.heroStatLbl}>Events/day</span></div>
              <div className={s.heroStatDiv} />
              <div className={s.heroStat}><span className={s.heroStatVal}>99.9%</span><span className={s.heroStatLbl}>Uptime</span></div>
              <div className={s.heroStatDiv} />
              <div className={s.heroStat}><span className={s.heroStatVal}>4,000+</span><span className={s.heroStatLbl}>Companies</span></div>
            </motion.div>
          </div>
          <motion.div {...rv(0.2)} className={s.heroRight}>
            <DashboardMock />
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className={s.scrollHint}>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>Scroll to explore ↓</motion.span>
        </motion.div>
      </section>

      {/* METRICS */}
      <section className={s.metricsSection}>
        <motion.div {...rv()} className={s.sectionHead}>
          <Badge>Key Metrics</Badge>
          <h2 className={s.sectionTitle}>Everything you need to measure</h2>
        </motion.div>
        <div className={s.metricsGrid}>
          {metrics.map((m, i) => (
            <motion.div key={m.label} {...rv(i * 0.07)} className={s.metricCard}>
              <div className={s.metricIcon}><m.icon size={22} strokeWidth={1.8} /></div>
              <div className={s.metricVal}>{m.value}</div>
              <div className={s.metricLabel}>{m.label}</div>
              <div className={s.metricChange}>{m.change}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={s.section}>
        <motion.div {...rv()} className={s.sectionHead}>
          <Badge>Features</Badge>
          <h2 className={s.sectionTitle}>Everything your business needs</h2>
          <p className={s.sectionSub}>A complete analytics platform built for modern data-driven teams.</p>
        </motion.div>
        <div className={s.featuresGrid}>
          {features.map((f, i) => (
            <motion.div key={f.title} {...rv(i * 0.06)} className={s.featureCard}>
              <div className={s.featureIcon}><f.icon size={22} strokeWidth={1.8} /></div>
              <h3 className={s.featureTitle}>{f.title}</h3>
              <p className={s.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DASHBOARD SHOWCASE */}
      <section id="dashboard" className={s.showcaseSection}>
        <motion.div {...rv()} className={s.sectionHead}>
          <Badge>Dashboard Showcase</Badge>
          <h2 className={s.sectionTitle}>See your data come alive</h2>
          <p className={s.sectionSub}>Every metric, chart, and insight in one unified view.</p>
        </motion.div>
        <motion.div {...rv(0.1)} className={s.bigMock}>
          <div className={s.bigMockBar}>
            <span className={s.mockDot} style={{ background: '#ef4444' }} />
            <span className={s.mockDot} style={{ background: '#f59e0b' }} />
            <span className={s.mockDot} style={{ background: '#22c55e' }} />
            <span className={s.bigMockBarTitle}>BizAnalytics — Full Dashboard</span>
          </div>
          <div className={s.bigMockContent}>
            <div className={s.bigKpis}>
              {[{ l: 'Revenue', v: '$94.2K', c: '#16a34a' }, { l: 'Orders', v: '1,203', c: '#10b981' }, { l: 'Customers', v: '12.4K', c: '#22c55e' }, { l: 'Profit', v: '48.2%', c: '#dc2626' }].map(k => (
                <div key={k.l} className={s.bigKpi} style={{ borderTop: `3px solid ${k.c}` }}>
                  <div className={s.bigKpiLabel}>{k.l}</div>
                  <div className={s.bigKpiVal} style={{ color: k.c }}>{k.v}</div>
                  <div className={s.bigKpiTrend}>▲ +12% vs last month</div>
                </div>
              ))}
            </div>
            <div className={s.bigCharts}>
              <div className={s.bigChartMain}>
                <div className={s.bigChartTitle}>Revenue & Expenses</div>
                <div className={s.bigChartBars}>
                  {[42, 48, 55, 51, 63, 71, 68, 78, 82, 90, 87, 94].map((h, i) => (
                    <div key={i} className={s.bigChartBarWrap}>
                      <div className={s.bigChartBar} style={{ height: `${h}%`, background: 'linear-gradient(180deg,#16a34a,#15803d)' }} />
                      <div className={s.bigChartBar} style={{ height: `${Math.floor(h * 0.55)}%`, background: 'rgba(239,68,68,0.5)' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.bigChartSide}>
                <div className={s.bigChartTitle}>Sales by Region</div>
                <svg viewBox="0 0 100 100" className={s.pieChart}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="20" strokeDasharray="88 64" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="55 97" strokeDashoffset="-88" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#dc2626" strokeWidth="20" strokeDasharray="38 114" strokeDashoffset="-143" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="26 126" strokeDashoffset="-181" />
                </svg>
                <div className={s.pieLegend}>
                  {[['#16a34a','North 35%'],['#22c55e','East 28%'],['#dc2626','South 22%'],['#ef4444','West 15%']].map(([c,l]) => (
                    <div key={l} className={s.pieLegendItem}><span className={s.pieDot} style={{ background: c as string }} />{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* MODULES */}
      <section className={s.section}>
        <motion.div {...rv()} className={s.sectionHead}>
          <Badge>Analytics Modules</Badge>
          <h2 className={s.sectionTitle}>Specialized analytics for every team</h2>
        </motion.div>
        <div className={s.modulesGrid}>
          {modules.map((m, i) => (
            <motion.div key={m.title} {...rv(i * 0.07)} className={s.moduleCard}>
              <div className={s.moduleIcon} style={{ background: `${m.color}20`, color: m.color }}><m.icon size={24} strokeWidth={1.8} /></div>
              <div className={s.moduleTitle}>{m.title}</div>
              <ArrowRight size={16} className={s.moduleArrow} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI INSIGHTS */}
      <section className={s.aiSection}>
        <div className={s.aiInner}>
          <motion.div {...rv()} className={s.sectionHead}>
            <Badge>AI Insights</Badge>
            <h2 className={s.sectionTitle}>Intelligence built into every decision</h2>
            <p className={s.sectionSub}>Our AI models run continuously on your data, surfacing opportunities before you even ask.</p>
          </motion.div>
          <div className={s.aiGrid}>
            {aiFeatures.map((a, i) => (
              <motion.div key={a.title} {...rv(i * 0.07)} className={s.aiCard}>
                <div className={s.aiNum}>0{i + 1}</div>
                <h3 className={s.aiTitle}>{a.title}</h3>
                <p className={s.aiDesc}>{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REPORTS */}
      <section id="reports" className={s.section}>
        <motion.div {...rv()} className={s.sectionHead}>
          <Badge>Reporting</Badge>
          <h2 className={s.sectionTitle}>Reports that write themselves</h2>
          <p className={s.sectionSub}>Generate, schedule, and share beautiful reports in one click.</p>
        </motion.div>
        <div className={s.reportsGrid}>
          {reports.map((r, i) => (
            <motion.div key={r.title} {...rv(i * 0.07)} className={s.reportCard}>
              <div className={s.reportIcon}><r.icon size={22} strokeWidth={1.8} /></div>
              <h3 className={s.reportTitle}>{r.title}</h3>
              <p className={s.reportDesc}>{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>



      {/* PRICING */}
      <section id="pricing" className={s.section}>
        <motion.div {...rv()} className={s.sectionHead}>
          <Badge>Pricing</Badge>
          <h2 className={s.sectionTitle}>Plans that scale with you</h2>
          <p className={s.sectionSub}>Start free, upgrade when you're ready. No hidden fees.</p>
        </motion.div>
        <div className={s.pricingGrid}>
          {plans.map((p, i) => (
            <motion.div key={p.name} {...rv(i * 0.1)} className={`${s.planCard} ${p.featured ? s.planFeatured : ''}`}>
              {p.featured && <span className={s.planBadge}>Most Popular</span>}
              <h3 className={s.planName}>{p.name}</h3>
              <div className={s.planPrice}><span className={s.planAmt}>{p.price}</span><span className={s.planNote}>{p.note}</span></div>
              <ul className={s.planFeatures}>
                {p.features.map(f => <li key={f}><Check size={14} className={s.checkIco} />{f}</li>)}
              </ul>
              <Link to="/auth/register" className={`${s.planCta} ${p.featured ? s.planCtaFeatured : ''}`}>{p.cta}</Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className={s.whySection}>
        <motion.div {...rv()} className={s.sectionHead}>
          <Badge>Why Choose Us</Badge>
          <h2 className={s.sectionTitle}>Built for serious businesses</h2>
        </motion.div>
        <div className={s.whyGrid}>
          {whyUs.map((w, i) => (
            <motion.div key={w.title} {...rv(i * 0.07)} className={s.whyCard}>
              <div className={s.whyIcon}><w.icon size={22} strokeWidth={1.8} /></div>
              <h3 className={s.whyTitle}>{w.title}</h3>
              <p className={s.whyDesc}>{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="contact" className={s.faqSection}>
        <motion.div {...rv()} className={s.sectionHead}>
          <Badge>FAQ</Badge>
          <h2 className={s.sectionTitle}>Common questions</h2>
        </motion.div>
        <div className={s.faqList}>
          {faqs.map((f, i) => (
            <motion.div key={f.q} {...rv(i * 0.06)} className={s.faqItem} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className={s.faqQ}>
                <span>{f.q}</span>
                <ChevronDown size={18} className={`${s.faqChev} ${openFaq === i ? s.faqChevOpen : ''}`} />
              </div>
              {openFaq === i && <div className={s.faqA}>{f.a}</div>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaSection}>
        <motion.h2 {...rv()} className={s.ctaTitle}>Ready To Unlock The Power Of Your Data?</motion.h2>
        <motion.p {...rv(0.1)} className={s.ctaSub}>Join 4,000+ companies already making smarter decisions with BizAnalytics. Free to start.</motion.p>
        <motion.div {...rv(0.2)} className={s.ctaBtns}>
          <Link to="/auth/register" className={s.btnPrimary}>Start Free Trial <ArrowRight size={16} /></Link>
          <a href="#dashboard" className={s.btnGhost}>Schedule Demo</a>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <div className={s.brand}>
              <div className={s.brandIcon}><Activity size={16} strokeWidth={2.5} /></div>
              <span className={s.brandName}>BizAnalytics</span>
            </div>
            <p className={s.footerAbout}>Transform your business data into actionable insights. Real-time analytics for modern businesses.</p>
          </div>
          <div className={s.footerLinks}>
            <div className={s.footerCol}><div className={s.footerColTitle}>Product</div>{['Features','Dashboard','Reports','Pricing','Changelog'].map(l=><a key={l} href="#">{l}</a>)}</div>
            <div className={s.footerCol}><div className={s.footerColTitle}>Resources</div>{['Documentation','API Reference','Blog','Status','Community'].map(l=><a key={l} href="#">{l}</a>)}</div>
            <div className={s.footerCol}><div className={s.footerColTitle}>Legal</div>{['Privacy Policy','Terms of Service','Security','GDPR'].map(l=><a key={l} href="#">{l}</a>)}</div>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© {new Date().getFullYear()} BizAnalytics. All rights reserved.</span>
          <div className={s.footerSocials}>
            {['Twitter','LinkedIn','GitHub','YouTube'].map(s2=><a key={s2} href="#" className={s.footerSocial}>{s2[0]}</a>)}
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
