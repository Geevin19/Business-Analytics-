"use client"

import dynamic from "next/dynamic"
import { ScrollProvider } from "@/components/scroll-context"
import { SiteNav } from "@/components/site-nav"
import {
  Hero,
  MetricsSection,
  ReachSection,
  ForecastSection,
  PricingSection,
  CtaSection,
  SiteFooter,
} from "@/components/sections"

const Scene3D = dynamic(() => import("@/components/scene-3d"), { ssr: false })

export default function Page() {
  return (
    <ScrollProvider>
      <Scene3D />
      <main className="relative z-10">
        {/* gradient veil so text stays readable over the 3D scene */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-background/40 via-background/10 to-background/50" />
        <SiteNav />
        <Hero />
        <MetricsSection />
        <ReachSection />
        <ForecastSection />
        <PricingSection />
        <CtaSection />
        <SiteFooter />
      </main>
    </ScrollProvider>
  )
}
