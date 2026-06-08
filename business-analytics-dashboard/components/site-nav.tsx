"use client"

import { motion } from "framer-motion"
import { Activity } from "lucide-react"

export function SiteNav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-mono text-lg font-semibold tracking-tight text-foreground">Helix</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#metrics" className="transition-colors hover:text-foreground">Metrics</a>
          <a href="#reach" className="transition-colors hover:text-foreground">Global Reach</a>
          <a href="#forecast" className="transition-colors hover:text-foreground">Forecasting</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
        </div>
        <a
          href="#cta"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Start free
        </a>
      </nav>
    </motion.header>
  )
}
