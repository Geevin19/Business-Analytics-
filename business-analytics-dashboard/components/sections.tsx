"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Globe2,
  LineChart,
  Zap,
  ShieldCheck,
  Database,
  Check,
} from "lucide-react"
import { Reveal, SectionLabel } from "./reveal"

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Real-time business intelligence</SectionLabel>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-balance font-sans text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl"
        >
          Your business data,
          <span className="block text-primary">in motion.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
        >
          Helix takes scattered, raw data and assembles it into one living
          system. Scroll to watch the same data points form charts, span the
          globe, project the future, and ignite into insight.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="#cta"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Start analyzing free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#metrics"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 font-medium text-foreground backdrop-blur transition-colors hover:bg-card"
          >
            See it live
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-8 font-mono text-xs uppercase tracking-widest text-muted-foreground"
        >
          <span>4.2B events / day</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">99.99% uptime</span>
          <span>·</span>
          <span>SOC 2 Type II</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-widest text-muted-foreground"
      >
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8 }}
          className="inline-block"
        >
          Scroll to explore
        </motion.span>
      </motion.div>
    </section>
  )
}

const stats = [
  { value: "+38%", label: "Avg. revenue lift", color: "text-primary" },
  { value: "12ms", label: "Query latency", color: "text-accent" },
  { value: "300+", label: "Data connectors", color: "text-foreground" },
]

export function MetricsSection() {
  return (
    <section id="metrics" className="relative flex min-h-screen items-center px-6 py-32">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <Reveal>
            <SectionLabel>Live metrics</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Every KPI, updated the instant it changes.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
              Stream events directly into Helix and watch your dashboards rebuild
              themselves. No nightly batch jobs, no stale numbers — just the truth,
              right now.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.15 + i * 0.08}>
                <div className="rounded-xl border border-border bg-card/40 p-4 backdrop-blur">
                  <div className={`font-mono text-2xl font-semibold ${s.color}`}>{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {[
            { icon: BarChart3, title: "Adaptive dashboards", body: "Layouts that reorganize around what matters most this week." },
            { icon: Zap, title: "Sub-second refresh", body: "Edge-cached aggregations keep the whole org in sync." },
            { icon: Database, title: "Unified warehouse", body: "Snowflake, BigQuery, Postgres and 300+ sources in one view." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={0.1 + i * 0.1}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ReachSection() {
  return (
    <section id="reach" className="relative flex min-h-screen items-center px-6 py-32">
      <div className="mx-auto max-w-2xl text-center md:ml-auto md:mr-0 md:text-right">
        <Reveal>
          <SectionLabel>Global reach</SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Watch demand light up across the planet.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground md:ml-auto md:max-w-md">
            Geographic intelligence maps customers, sessions, and revenue onto a
            live globe. Spot emerging markets the moment they emerge.
          </p>
        </Reveal>
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-end">
          {["Americas", "EMEA", "APAC", "LATAM"].map((r, i) => (
            <Reveal key={r} delay={0.15 + i * 0.06}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 text-sm text-foreground backdrop-blur">
                <Globe2 className="h-4 w-4 text-accent" />
                {r}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ForecastSection() {
  return (
    <section id="forecast" className="relative flex min-h-screen items-center px-6 py-32">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <SectionLabel>Predictive forecasting</SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            See where the trend line is heading — before it gets there.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            Helix layers ML forecasting on top of your historical data, projecting
            revenue, churn, and inventory with confidence intervals you can defend
            in the boardroom.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            { icon: LineChart, title: "Scenario modeling", body: "Compare best, base, and worst cases side by side." },
            { icon: ShieldCheck, title: "Anomaly alerts", body: "Get pinged the moment a metric breaks its forecast band." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={0.12 + i * 0.1}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const plans = [
  {
    name: "Starter",
    price: "$0",
    note: "/mo",
    features: ["Up to 5 dashboards", "10 data connectors", "7-day history", "Community support"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Growth",
    price: "$49",
    note: "/seat / mo",
    features: ["Unlimited dashboards", "300+ connectors", "ML forecasting", "Priority support", "SOC 2 reports"],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "",
    features: ["Dedicated warehouse", "SSO & SCIM", "Custom SLAs", "Solutions engineer"],
    cta: "Talk to sales",
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <Reveal>
            <SectionLabel>Pricing</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mx-auto mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Plans that scale with your data, not against your budget.
            </h2>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-7 backdrop-blur ${
                  p.featured
                    ? "border-primary bg-card/70 shadow-[0_0_40px_-12px] shadow-primary/40"
                    : "border-border bg-card/40"
                }`}
              >
                {p.featured && (
                  <span className="mb-4 w-fit rounded-full bg-primary px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-medium text-foreground">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-semibold text-foreground">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.note}</span>
                </div>
                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#cta"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-transform hover:scale-[1.02] ${
                    p.featured
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card/40 text-foreground hover:bg-card"
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CtaSection() {
  return (
    <section id="cta" className="relative px-6 py-40">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Then it all comes together as your unfair advantage.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            Join 4,000+ teams running their business on Helix. Free to start, no
            credit card required.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-7 py-3.5 font-medium text-foreground backdrop-blur transition-colors hover:bg-card"
            >
              Book a demo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <span className="font-mono text-foreground">Helix</span>
        <span>© {new Date().getFullYear()} Helix Analytics, Inc. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
          <a href="#" className="transition-colors hover:text-foreground">Terms</a>
          <a href="#" className="transition-colors hover:text-foreground">Status</a>
        </div>
      </div>
    </footer>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof BarChart3
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur transition-colors hover:bg-card/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-medium text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
