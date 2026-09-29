"use client"

import { useTheme } from "next-themes"
import { createContext, useContext, useEffect, type ReactNode } from "react"
import { Toaster } from "sonner"

import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { initDemo } from "@/lib/demo/store"
import { DESKTOP, useMediaQuery } from "@/lib/use-media-query"

import { WalletPrompt } from "./wallet-prompt"

export interface AppCopy {
  locale: Locale
  app: Dictionary["app"]
  valueNotice: string
  demoBadge: string
  close: string
}

const AppContext = createContext<AppCopy | null>(null)

export function useAppCopy(): AppCopy {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppCopy must be used inside <AppProvider>")
  return ctx
}

export function AppProvider({ value, children }: { value: AppCopy; children: ReactNode }) {
  const { resolvedTheme } = useTheme()
  const desktop = useMediaQuery(DESKTOP)
  useEffect(() => {
    initDemo()
  }, [])

  return (
    <AppContext.Provider value={value}>
      {children}
      <WalletPrompt />
      <Toaster
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        // Toasts are only used for background events (reset, a passer-by sale,
        // a top-up). Bottom-left on desktop keeps them off the basket, the
        // receipt and the farm rail on the right; on phones they sit at the
        // top, below the header, away from the basket bar at the bottom.
        position={desktop ? "bottom-left" : "top-center"}
        offset={{ bottom: 24, left: 24 }}
        mobileOffset={{ top: 72, left: 16, right: 16 }}
        toastOptions={{
          classNames: {
            toast: "!rounded-md !border !border-border !bg-popover !text-popover-foreground !font-sans !shadow-none",
            description: "!text-muted-foreground",
          },
        }}
      />
    </AppContext.Provider>
  )
}
