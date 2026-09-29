"use client"

import { useSyncExternalStore } from "react"

/** True when the media query matches; false during SSR and the first client render. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

export const DESKTOP = "(min-width: 1024px)"
