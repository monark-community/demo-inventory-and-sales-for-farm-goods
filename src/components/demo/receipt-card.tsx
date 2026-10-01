"use client"

import { Gift, Stamp } from "lucide-react"
import type { ReactNode } from "react"

import { t } from "@/i18n/t"
import { getStand } from "@/lib/demo/catalog"
import type { DemoState, Sale } from "@/lib/demo/types"
import { dateTime, money, num, shortHash, tusdc } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

interface Props {
  sale: Sale
  demo: DemoState
  /** Play the PAID stamp (only right after paying). */
  stampIn?: boolean
  headline?: ReactNode
  footer?: ReactNode
  className?: string
}

/** A paper receipt with a torn edge. The rubber-stamp PAID lands when it's fresh. */
export function ReceiptCard({ sale, demo, stampIn, headline, footer, className }: Props) {
  const { app, locale } = useAppCopy()
  const r = app.receipt
  const stand = getStand(sale.standId)
  const name = (id: string) => demo.products.find((p) => p.id === id)?.name[locale] ?? id

  return (
    <article className={cn("receipt-edge relative bg-paper px-4 pt-4 text-foreground shadow-crate-sm", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-5 right-4 rotate-[-8deg] rounded-sm border-[3px] border-primary px-2 py-0.5 font-display text-2xl font-bold tracking-widest text-primary opacity-90",
          stampIn && "bz-stamp"
        )}
      >
        {r.paid}
      </span>
      {headline}
      <p className="text-xs text-muted-foreground">{r.stand}</p>
      <p className="pr-24 font-display text-lg leading-tight font-bold">{stand?.name}</p>
      <ul className="mt-3 space-y-1 border-t border-dashed border-input pt-3 text-sm">
        {sale.lines.map((l) => (
          <li key={l.productId} className="flex justify-between gap-3">
            <span>
              {l.qty} × {name(l.productId)}
            </span>
            <span className="tnum">{money(l.qty * l.unitPrice, locale)}</span>
          </li>
        ))}
        {sale.discount > 0 && (
          <li className="flex justify-between gap-3 text-success">
            <span className="inline-flex items-center gap-1">
              <Gift className="size-3.5" aria-hidden="true" />
              {r.discount}
            </span>
            <span className="tnum">−{money(sale.discount, locale)}</span>
          </li>
        )}
      </ul>
      <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-input pt-3">
        <span className="font-semibold">{r.total}</span>
        <span className="font-display text-2xl font-bold tnum">{tusdc(sale.total, locale)}</span>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        <dt>{r.when}</dt>
        <dd className="text-right tnum">{dateTime(sale.at, locale)}</dd>
        <dt>{r.block}</dt>
        <dd className="text-right tnum">{num(sale.block, locale)}</dd>
        <dt>{r.tx}</dt>
        <dd className="text-right font-mono" title={sale.hash}>
          {shortHash(sale.hash)}
        </dd>
      </dl>
      {footer}
    </article>
  )
}

export function StampLine({ added, filled, stamps }: { added: boolean; filled: boolean; stamps: number }) {
  const { app } = useAppCopy()
  if (!added) return null
  return (
    <p className={cn("flex items-center gap-2 text-sm font-semibold", filled ? "text-success" : "text-foreground")}>
      {filled ? <Gift className="size-4" aria-hidden="true" /> : <Stamp className="size-4 text-primary" aria-hidden="true" />}
      {filled ? app.receipt.cardFilled : t(app.receipt.stampAdded, { n: stamps })}
    </p>
  )
}
