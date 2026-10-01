"use client"

import { ArrowLeft, Clock, MapPin, ShoppingBasket, Sunset } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { href } from "@/i18n/config"
import { plural, t } from "@/i18n/t"
import { getStand } from "@/lib/demo/catalog"
import { useTx } from "@/lib/demo/chain"
import { basketLines, linesTotal, rewardDiscount, setBasketQty, standProducts, type PurchaseResult } from "@/lib/demo/ops"
import { markdownActive, standNow } from "@/lib/demo/pricing"
import { useDemo } from "@/lib/demo/store"
import { clockLabel, time, tusdc } from "@/lib/format"
import { DESKTOP, useMediaQuery } from "@/lib/use-media-query"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { Checkout } from "./checkout"
import { FarmRail } from "./farm-rail"
import { ProductCard } from "./product-card"
import { StampCard } from "./stamp-card"
import { useNow } from "./use-now"

/** Flow 1: a stand's shelf, basket, payment and receipt, with the farm's view alongside. */
export function StandView({ standId }: { standId: string }) {
  const { app, locale, close } = useAppCopy()
  const s = app.stand
  const demo = useDemo()
  const now = useNow(30_000)
  const desktop = useMediaQuery(DESKTOP)
  const tx = useTx()
  const faucetTx = useTx()
  const [result, setResult] = useState<PurchaseResult | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const stand = getStand(standId)

  if (!stand) return <p className="container-page py-16">{s.notFound}</p>
  if (!demo || now === null) {
    return (
      <div className="container-page py-10" aria-busy="true">
        <p className="text-muted-foreground">{s.loading}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  const clock = standNow(demo.settings.clockOffsetMin, now)
  const markdownOn = markdownActive(stand, clock)
  const products = standProducts(demo, standId)
  const basket = demo.basket[standId] ?? {}
  const lines = basketLines(demo, standId)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = linesTotal(lines)
  const total = subtotal - rewardDiscount(demo, standId, subtotal, true)
  const locked = tx.busy
  const hasReceipt = tx.state.phase === "confirmed" && !!result?.sale

  const done = () => {
    tx.reset()
    setResult(null)
    setSheetOpen(false)
  }

  const checkout = (
    <Checkout
      standId={standId}
      demo={demo}
      tx={tx}
      faucetTx={faucetTx}
      result={result}
      onPurchased={(r) => {
        setResult(r)
        if (!desktop) setSheetOpen(true)
      }}
      onDone={done}
    />
  )

  return (
    <div className="container-page py-6 pb-28 lg:py-10 lg:pb-12">
      <Link href={href(locale, "/app")} className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {s.back}
      </Link>

      <header className="mt-3 grid gap-4 border-b pb-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow text-primary">{t(s.by, { farmer: stand.farmer })}</p>
          <h1 className="mt-1.5 text-3xl sm:text-4xl">{stand.name}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {stand.place[locale]}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium tnum">
              <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
              {t(s.clock, { time: time(clock, locale) })}
            </span>
            <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 font-semibold", markdownOn ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
              <Sunset className="size-4" aria-hidden="true" />
              {markdownOn ? s.markdownOn : t(s.markdownFrom, { time: clockLabel(stand.markdownFrom, locale) })}
            </span>
          </p>
        </div>
        <StampCard
          stamps={demo.stamps[standId] ?? 0}
          reward={(demo.rewards[standId] ?? 0) > 0}
          justPunched={!!result?.stampAdded}
          className="md:w-72"
        />
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <section aria-labelledby="shelf-title">
          <h2 id="shelf-title" className="text-xl">
            {s.shelf}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                qty={basket[p.id] ?? 0}
                markdownOn={markdownOn}
                disabled={locked || hasReceipt}
                onChange={(q) => setBasketQty(standId, p.id, q)}
              />
            ))}
          </ul>
          <div className="mt-8 lg:hidden">
            <FarmRail standId={standId} demo={demo} />
          </div>
        </section>

        <aside className="hidden space-y-6 lg:block">
          <section aria-labelledby="basket-title" className="rounded-lg border bg-card p-4 shadow-crate-sm">
            <h2 id="basket-title" className="mb-4 flex items-center gap-2 text-lg">
              <ShoppingBasket className="size-5 text-primary" aria-hidden="true" />
              {app.basket.title}
            </h2>
            {desktop && checkout}
          </section>
          <FarmRail standId={standId} demo={demo} />
        </aside>
      </div>

      {/* Phones: a basket bar above the bottom edge, opening the checkout sheet. */}
      {!desktop && (count > 0 || hasReceipt || tx.busy) && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <Button size="lg" className="w-full justify-between" onClick={() => setSheetOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <ShoppingBasket aria-hidden="true" />
              {hasReceipt ? app.receipt.paid : plural(count, app.basket.items)}
            </span>
            <span className="tnum">{hasReceipt ? app.basket.view : tusdc(total, locale)}</span>
          </Button>
        </div>
      )}
      {!desktop && (
        <Sheet open={sheetOpen} onOpenChange={(open) => (tx.busy ? null : setSheetOpen(open))}>
          <SheetContent side="bottom" closeLabel={close} className="max-h-[88dvh] overflow-y-auto rounded-t-xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <ShoppingBasket className="size-5 text-primary" aria-hidden="true" />
              {app.basket.title}
            </SheetTitle>
            <SheetDescription className="sr-only">{stand.name}</SheetDescription>
            {checkout}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
