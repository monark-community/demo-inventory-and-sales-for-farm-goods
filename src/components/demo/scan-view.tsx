"use client"

import { MapPin, ScanLine } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { LogoMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { stands } from "@/lib/demo/catalog"
import { useDemo } from "@/lib/demo/store"
import { num } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { QrCode } from "./qr-code"

/** Simulated QR scanning: tap a stand sign in the viewfinder, the camera "locks on", the shelf opens. */
export function ScanView({ origin }: { origin: string }) {
  const { app, locale } = useAppCopy()
  const s = app.scan
  const router = useRouter()
  const demo = useDemo()
  const [scanning, setScanning] = useState<string | null>(null)
  const timer = useRef<number | null>(null)
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const scan = (id: string) => {
    if (scanning) return
    setScanning(id)
    router.prefetch(href(locale, `/app/stand/${id}`))
    timer.current = window.setTimeout(() => router.push(href(locale, `/app/stand/${id}`)), 1100)
  }
  const scanned = stands.find((x) => x.id === scanning)

  return (
    <div className="container-page grid gap-10 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-12">
      <section aria-labelledby="scan-title">
        <h1 id="scan-title" className="text-3xl sm:text-4xl">
          {s.title}
        </h1>

        <div
          role="group"
          aria-label={s.viewfinder}
          className="relative mt-6 overflow-hidden rounded-lg border-[6px] border-foreground bg-[#2a2620] p-4 sm:p-6"
        >
          {/* Viewfinder corners and scan line */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-md border-2 border-dashed border-white/25" />
          {!scanning && <span aria-hidden="true" className="bz-scanline pointer-events-none absolute inset-x-6 top-6 h-0.5 bg-accent/80 [--scan-h:220px]" />}
          <p className="relative mb-4 flex items-center gap-2 text-sm font-semibold text-white/85" aria-live="polite">
            <ScanLine className="size-4" aria-hidden="true" />
            {scanned ? (
              <>
                {s.scanning} <span className="sr-only">{t(s.found, { name: scanned.name })}</span>
              </>
            ) : (
              s.tapToScan
            )}
          </p>
          <ul className="relative grid gap-3 sm:grid-cols-3">
            {stands.map((stand) => {
              const active = scanning === stand.id
              return (
                <li key={stand.id}>
                  <button
                    type="button"
                    onClick={() => scan(stand.id)}
                    disabled={!!scanning}
                    aria-label={`${stand.name}, ${stand.place[locale]}`}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-md bg-paper p-3 text-left text-foreground transition-transform outline-none focus-visible:ring-4 focus-visible:ring-accent sm:flex-col sm:items-start",
                      active && "ring-4 ring-accent",
                      scanning && !active && "opacity-40"
                    )}
                  >
                    <QrCode value={`${origin}/${locale}/app/stand/${stand.id}`} className="size-20 shrink-0 sm:size-full" />
                    <span className="min-w-0 sm:w-full">
                      <span className="flex items-start gap-1.5 font-display text-base leading-tight font-bold">
                        <LogoMark className="mt-0.5 size-4" />
                        <span>{stand.name}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{stand.place[locale]}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <aside>
        <section aria-labelledby="nearby-title" className="rounded-lg border bg-card p-5">
          <h2 id="nearby-title" className="text-xl">
            {s.nearby}
          </h2>
          <ul className="mt-4 divide-y divide-dashed divide-input">
            {stands.map((stand) => {
              const inStock = demo ? demo.products.filter((p) => p.standId === stand.id && p.active && p.stock > 0).length : null
              return (
                <li key={stand.id} className="flex items-center gap-3 py-3">
                  <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{stand.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {stand.distanceKm < 1 ? s.here : t(s.away, { km: num(stand.distanceKm, locale) })}
                      {inStock !== null && <> · {t(s.products, { n: inStock })}</>}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={href(locale, `/app/stand/${stand.id}`)} aria-label={`${s.open}: ${stand.name}`}>
                      {s.open}
                    </Link>
                  </Button>
                </li>
              )
            })}
          </ul>
        </section>
      </aside>
    </div>
  )
}
