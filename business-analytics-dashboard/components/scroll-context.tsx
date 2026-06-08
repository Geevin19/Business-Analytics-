"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"

const ScrollContext = createContext(0)

export function useScrollProgress() {
  return useContext(ScrollContext)
}

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (raf.current !== null) return
      raf.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? window.scrollY / max : 0)
        raf.current = null
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [])

  return <ScrollContext.Provider value={progress}>{children}</ScrollContext.Provider>
}
