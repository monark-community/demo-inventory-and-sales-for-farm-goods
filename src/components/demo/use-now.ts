"use client"

import { useEffect, useState } from "react"

/** The current time, refreshed every `every` ms; null until mounted (avoids hydration mismatches). */
export function useNow(every = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, every)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [every])
  return now
}
