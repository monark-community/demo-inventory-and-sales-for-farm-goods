"use client"

import { Minus, Plus } from "lucide-react"
import { forwardRef, useImperativeHandle, useState } from "react"

import { ProduceBadge } from "@/components/produce/produce-icon"
import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { plural, t } from "@/i18n/t"
import { getStand } from "@/lib/demo/catalog"
import { useTx } from "@/lib/demo/chain"
import { publishShelf, standProducts, type ShelfChange } from "@/lib/demo/ops"
import type { DemoState, Product } from "@/lib/demo/types"
import { clockLabel, money } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { TxFeedback } from "./tx-feedback"

type Draft = Partial<{ price: string; stock: string; lowAt: string; markdownPct: number; active: boolean }>

const PRICE = /^\d{1,4}([.,]\d{1,2})?$/
const STOCK = /^\d{1,3}$/
const ALERT = /^\d{1,2}$/
const MARKDOWNS = [0, 20, 30, 50]

function parsePrice(v: string): number | null {
  if (!PRICE.test(v.trim())) return null
  const cents = Math.round(Number(v.trim().replace(",", ".")) * 100)
  return cents > 0 ? cents : null
}

export interface ShelfEditorHandle {
  restock: (productId: string) => void
}

/** Flow 3: edit prices, stock, alerts and markdowns as a draft, then publish them in one transaction. */
export const ShelfEditor = forwardRef<ShelfEditorHandle, { standId: string; demo: DemoState }>(function ShelfEditor({ standId, demo }, ref) {
  const { app, locale } = useAppCopy()
  const f = app.farm
  const stand = getStand(standId)!
  const tx = useTx()
  const [draft, setDraft] = useState<Record<string, Draft>>({})
  const products = standProducts(demo, standId)

  const edit = (id: string, patch: Draft) => {
    if (tx.state.phase === "confirmed" || tx.state.phase === "failed") tx.reset()
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...patch } }))
  }

  useImperativeHandle(ref, () => ({
    restock: (id) => {
      const p = products.find((x) => x.id === id)
      if (!p) return
      const current = draft[id]?.stock ?? String(p.stock)
      const next = Math.min(999, (STOCK.test(current) ? Number(current) : p.stock) + 12)
      edit(id, { stock: String(next) })
      const el = document.getElementById(`stock-${id}`)
      el?.scrollIntoView({ block: "center", behavior: "smooth" })
      el?.focus({ preventScroll: true })
    },
  }))

  // Validate and compute the changes against the live shelf.
  const errors: Record<string, Partial<Record<"price" | "stock" | "lowAt", string>>> = {}
  const changes: Record<string, ShelfChange> = {}
  for (const p of products) {
    const d = draft[p.id]
    if (!d) continue
    const change: ShelfChange = {}
    const err: (typeof errors)[string] = {}
    if (d.price !== undefined) {
      const cents = parsePrice(d.price)
      if (cents === null) err.price = f.errors.price
      else if (cents !== p.price) change.price = cents
    }
    if (d.stock !== undefined) {
      if (!STOCK.test(d.stock.trim())) err.stock = f.errors.stock
      else if (Number(d.stock) !== p.stock) change.stock = Number(d.stock)
    }
    if (d.lowAt !== undefined) {
      if (!ALERT.test(d.lowAt.trim())) err.lowAt = f.errors.alertAt
      else if (Number(d.lowAt) !== p.lowAt) change.lowAt = Number(d.lowAt)
    }
    if (d.markdownPct !== undefined && d.markdownPct !== p.markdownPct) change.markdownPct = d.markdownPct
    if (d.active !== undefined && d.active !== p.active) change.active = d.active
    if (Object.keys(err).length) errors[p.id] = err
    if (Object.keys(change).length) changes[p.id] = change
  }
  const nChanges = Object.keys(changes).length
  const hasErrors = Object.keys(errors).length > 0

  const publish = async () => {
    if (hasErrors || nChanges === 0) return
    const snapshot = changes
    const ok = await tx.run(
      {
        title: f.publishTitle,
        account: "farmer",
        to: stand.contract,
        toLabel: stand.name,
        lines: Object.keys(snapshot).map((id) => ({
          label: products.find((p) => p.id === id)?.name[locale] ?? id,
          value: describe(products.find((p) => p.id === id)!, snapshot[id]!),
        })),
        movesFunds: false,
      },
      (hash) => publishShelf(standId, snapshot, hash)
    )
    if (ok) setDraft({})
  }

  function describe(p: Product, c: ShelfChange): string {
    const parts: string[] = []
    if (c.price !== undefined) parts.push(`${money(p.price, locale)} → ${money(c.price, locale)}`)
    if (c.stock !== undefined) parts.push(`${p.stock} → ${c.stock}`)
    if (c.lowAt !== undefined) parts.push(`${f.columns.alertAt} ${c.lowAt}`)
    if (c.markdownPct !== undefined) parts.push(c.markdownPct ? t(f.markdownPct, { pct: c.markdownPct }) : f.noMarkdown)
    if (c.active !== undefined) parts.push(c.active ? "✓" : "✕")
    return parts.join(" · ")
  }

  const busy = tx.busy

  return (
    <section aria-labelledby="shelf-editor-title" className="rounded-lg border bg-card">
      <div className="border-b p-4 sm:p-5">
        <h2 id="shelf-editor-title" className="flex items-center gap-1 text-xl">
          {f.shelfTitle}
          <InfoTip label={f.shelfInfoLabel}>{t(f.shelfBody, { time: clockLabel(stand.markdownFrom, locale) })}</InfoTip>
        </h2>
      </div>

      <div className="hidden grid-cols-[minmax(10rem,1.5fr)_6.5rem_9.5rem_5rem_7rem_4rem] gap-3 border-b px-5 py-2 text-xs font-semibold text-muted-foreground xl:grid">
        <span>{f.columns.product}</span>
        <span>{f.columns.price}</span>
        <span>{f.columns.stock}</span>
        <span>{f.columns.alertAt}</span>
        <span>{f.columns.markdown}</span>
        <span>{f.columns.active}</span>
      </div>

      <ul className="divide-y">
        {products.map((p) => {
          const d = draft[p.id] ?? {}
          const err = errors[p.id] ?? {}
          const name = p.name[locale]
          const stockStr = d.stock ?? String(p.stock)
          const stockNum = STOCK.test(stockStr) ? Number(stockStr) : p.stock
          const changed = !!changes[p.id]
          return (
            <li key={p.id} className={cn("grid grid-cols-2 gap-3 p-4 sm:p-5 xl:grid-cols-[minmax(10rem,1.5fr)_6.5rem_9.5rem_5rem_7rem_4rem] xl:items-start xl:py-3", changed && "bg-accent/10")}>
              <div className="col-span-2 flex items-center gap-3 xl:col-span-1">
                <ProduceBadge icon={p.icon} tone={p.tone} className="size-10" iconClassName="size-5" />
                <div className="min-w-0">
                  <p className="leading-snug font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{p.unit[locale]}</p>
                </div>
              </div>

              <div>
                <label htmlFor={`price-${p.id}`} className="mb-1 block text-xs font-semibold text-muted-foreground xl:sr-only">
                  {f.columns.price}
                </label>
                <Input
                  id={`price-${p.id}`}
                  inputMode="decimal"
                  aria-label={t(f.priceLabel, { product: name })}
                  aria-invalid={!!err.price || undefined}
                  aria-describedby={err.price ? `price-${p.id}-err` : undefined}
                  value={d.price ?? money(p.price, locale)}
                  onChange={(e) => edit(p.id, { price: e.target.value })}
                  disabled={busy}
                  className="h-10 tnum"
                />
                {err.price && (
                  <p id={`price-${p.id}-err`} className="mt-1 text-xs text-destructive">
                    {err.price}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={`stock-${p.id}`} className="mb-1 block text-xs font-semibold text-muted-foreground xl:sr-only">
                  {f.columns.stock}
                </label>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" aria-label={t(f.decrease, { product: name })} disabled={busy || stockNum <= 0} onClick={() => edit(p.id, { stock: String(Math.max(0, stockNum - 1)) })}>
                    <Minus aria-hidden="true" />
                  </Button>
                  <Input
                    id={`stock-${p.id}`}
                    inputMode="numeric"
                    aria-label={t(f.stockLabel, { product: name })}
                    aria-invalid={!!err.stock || undefined}
                    aria-describedby={err.stock ? `stock-${p.id}-err` : undefined}
                    value={stockStr}
                    onChange={(e) => edit(p.id, { stock: e.target.value })}
                    disabled={busy}
                    className="h-10 w-full min-w-0 text-center tnum"
                  />
                  <Button size="icon" variant="outline" aria-label={t(f.increase, { product: name })} disabled={busy || stockNum >= 999} onClick={() => edit(p.id, { stock: String(Math.min(999, stockNum + 1)) })}>
                    <Plus aria-hidden="true" />
                  </Button>
                </div>
                {err.stock && (
                  <p id={`stock-${p.id}-err`} className="mt-1 text-xs text-destructive">
                    {err.stock}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={`alert-${p.id}`} className="mb-1 block text-xs font-semibold text-muted-foreground xl:sr-only">
                  {f.columns.alertAt}
                </label>
                <Input
                  id={`alert-${p.id}`}
                  inputMode="numeric"
                  aria-label={t(f.alertLabel, { product: name })}
                  aria-invalid={!!err.lowAt || undefined}
                  aria-describedby={err.lowAt ? `alert-${p.id}-err` : undefined}
                  value={d.lowAt ?? String(p.lowAt)}
                  onChange={(e) => edit(p.id, { lowAt: e.target.value })}
                  disabled={busy}
                  className="h-10 tnum"
                />
                {err.lowAt && (
                  <p id={`alert-${p.id}-err`} className="mt-1 text-xs text-destructive">
                    {err.lowAt}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={`md-${p.id}`} className="mb-1 block text-xs font-semibold text-muted-foreground xl:sr-only">
                  {f.columns.markdown}
                </label>
                <select
                  id={`md-${p.id}`}
                  aria-label={t(f.markdownLabel, { product: name })}
                  value={d.markdownPct ?? p.markdownPct}
                  onChange={(e) => edit(p.id, { markdownPct: Number(e.target.value) })}
                  disabled={busy}
                  className="h-10 w-full rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {MARKDOWNS.map((m) => (
                    <option key={m} value={m}>
                      {m === 0 ? f.noMarkdown : t(f.markdownPct, { pct: m })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 xl:h-10">
                <Switch
                  id={`active-${p.id}`}
                  aria-label={t(f.activeLabel, { product: name })}
                  checked={d.active ?? p.active}
                  onCheckedChange={(v) => edit(p.id, { active: v })}
                  disabled={busy}
                />
                <label htmlFor={`active-${p.id}`} className="text-xs font-semibold text-muted-foreground xl:sr-only">
                  {f.columns.active}
                </label>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="space-y-3 rounded-b-lg border-t bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={cn("text-sm font-semibold", nChanges ? "text-foreground" : "text-muted-foreground")} aria-live="polite">
            {nChanges ? plural(nChanges, f.draft) : f.noChanges}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {Object.keys(draft).length > 0 && (
              <Button variant="ghost" onClick={() => setDraft({})} disabled={busy}>
                {f.discard}
              </Button>
            )}
            <Button onClick={publish} disabled={busy || hasErrors || nChanges === 0}>
              {f.publish}
            </Button>
          </div>
        </div>
        <TxFeedback state={tx.state} confirmed={f.published} failed={{ reverted: f.publishFailed }} onRetry={nChanges > 0 ? publish : undefined} onDismiss={tx.reset} />
      </div>
    </section>
  )
})
