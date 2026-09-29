"use client"

import { BellRing, ClipboardCheck, Landmark, PencilLine, ReceiptText } from "lucide-react"

import { plural, t } from "@/i18n/t"
import { SHOPPER_ADDRESS } from "@/lib/demo/catalog"
import type { DemoState, LedgerEntry } from "@/lib/demo/types"
import { money, shortAddress, time, tusdc } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

/** One line of a stand's ledger, as the grower sees it. `fresh` prints it in with the ticket animation. */
export function LedgerItem({ entry, demo, fresh, compact }: { entry: LedgerEntry; demo: DemoState; fresh?: boolean; compact?: boolean }) {
  const { app, locale } = useAppCopy()
  const l = app.ledger
  const name = (id: string) => demo.products.find((p) => p.id === id)?.name[locale] ?? id

  let icon = <ReceiptText className="size-4 text-primary" aria-hidden="true" />
  let text = ""
  let sub: string | null = null
  let amount: string | null = null
  let tone = "bg-paper"

  switch (entry.kind) {
    case "sale": {
      const sale = demo.sales.find((s) => s.id === entry.saleId)
      if (!sale) return null
      text = t(l.sale, { items: sale.lines.map((x) => `${x.qty} × ${name(x.productId)}`).join(", ") })
      sub = t(l.saleTo, { buyer: sale.buyer === SHOPPER_ADDRESS ? l.you : shortAddress(sale.buyer) })
      amount = `+${money(sale.total, locale)}`
      break
    }
    case "alert":
      icon = <BellRing className="size-4 text-warning" aria-hidden="true" />
      text = t(l.alert, { product: name(entry.productId), n: entry.stock })
      tone = "border-warning/40 bg-accent/20"
      break
    case "shelf":
      icon = <PencilLine className="size-4 text-muted-foreground" aria-hidden="true" />
      text = plural(entry.changes, l.shelf)
      break
    case "count":
      icon = <ClipboardCheck className="size-4 text-muted-foreground" aria-hidden="true" />
      text = entry.missing > 0 ? t(l.count, { n: entry.missing, value: tusdc(entry.missingValue, locale) }) : l.countClean
      if (entry.missing > 0) tone = "border-destructive/30 bg-destructive/5"
      break
    case "withdraw":
      icon = <Landmark className="size-4 text-success" aria-hidden="true" />
      text = t(l.withdraw, { amount: tusdc(entry.amount, locale) })
      break
  }

  return (
    <li className={cn("flex gap-3 rounded-md border", compact ? "p-2.5" : "p-3", tone, fresh && "bz-print")}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1 text-sm leading-snug">
        <p>
          <span className="mr-2 text-muted-foreground tnum">{time(entry.at, locale)}</span>
          {text}
        </p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      {amount && <span className="shrink-0 text-sm font-semibold tnum">{amount}</span>}
    </li>
  )
}
