"use client"

import { Minus, Plus } from "lucide-react"

import { ProduceBadge } from "@/components/produce/produce-icon"
import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { effectivePrice } from "@/lib/demo/pricing"
import type { Product } from "@/lib/demo/types"
import { money } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

interface Props {
  product: Product
  qty: number
  markdownOn: boolean
  disabled: boolean
  onChange: (qty: number) => void
}

/** One crate on the shelf: price tag, live stock tally and a basket stepper. */
export function ProductCard({ product: p, qty, markdownOn, disabled, onChange }: Props) {
  const { app, locale } = useAppCopy()
  const s = app.stand
  const name = p.name[locale]
  const price = effectivePrice(p, markdownOn)
  const discounted = price !== p.price
  const soldOut = p.stock <= 0
  const unavailable = !p.active
  const max = Math.min(p.stock, p.maxPerOrder)
  const low = !soldOut && p.stock <= p.lowAt

  return (
    <li className={cn("flex flex-col rounded-lg border bg-card p-3.5", (soldOut || unavailable) && "bg-muted/50")}>
      <div className="flex gap-3">
        <ProduceBadge icon={p.icon} tone={p.tone} className={cn((soldOut || unavailable) && "opacity-60")} />
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base leading-snug font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{t(s.per, { unit: p.unit[locale] })}</p>
        </div>
        <div className="text-right">
          <p className={cn("font-display text-2xl leading-none font-bold tnum", discounted && "text-primary")}>{money(price, locale)}</p>
          {discounted && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="line-through">{t(s.was, { price: money(p.price, locale) })}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {unavailable ? (
          <span className="text-muted-foreground">{s.unavailable}</span>
        ) : soldOut ? (
          <span className="font-semibold text-muted-foreground">{s.soldOut}</span>
        ) : (
          <span className={cn("font-semibold tnum", low ? "text-warning" : "text-foreground")}>
            <span key={p.stock} className="bz-roll">
              {t(s.left, { n: p.stock })}
            </span>
          </span>
        )}
        {discounted && (
          <span className="tag-notch bg-accent py-0.5 pr-2 pl-3.5 text-xs font-bold text-accent-foreground">{t(s.off, { pct: p.markdownPct })}</span>
        )}
        {!soldOut && !unavailable && p.maxPerOrder < 99 && <span className="text-xs text-muted-foreground">{t(s.limit, { n: p.maxPerOrder })}</span>}
      </div>

      <div className="mt-auto pt-3">
        {qty === 0 ? (
          <Button
            variant="outline"
            className="w-full"
            disabled={disabled || soldOut || unavailable}
            onClick={() => onChange(1)}
            aria-label={t(s.addNamed, { name })}
          >
            <Plus aria-hidden="true" />
            {s.add}
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-md border border-primary/50 bg-primary/5 p-1">
            <Button size="icon" variant="ghost" disabled={disabled} onClick={() => onChange(qty - 1)} aria-label={t(s.remove, { name })}>
              <Minus aria-hidden="true" />
            </Button>
            <span className="text-sm font-semibold tnum" aria-live="polite">
              {t(s.inBasket, { n: qty })}
            </span>
            <Button size="icon" variant="ghost" disabled={disabled || qty >= max} onClick={() => onChange(qty + 1)} aria-label={t(s.addOne, { name })}>
              <Plus aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </li>
  )
}
