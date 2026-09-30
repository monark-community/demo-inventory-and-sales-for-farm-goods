"use client"

import { ArrowLeft, Check, Landmark, Minus, Plus, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { ProduceBadge } from "@/components/produce/produce-icon"
import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { Input } from "@/components/ui/input"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { DEMO_STAND_ID, getStand } from "@/lib/demo/catalog"
import { useTx } from "@/lib/demo/chain"
import { recordCount, standProducts, withdraw } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import { shortDate, tusdc } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { OwnerGate } from "./owner-gate"
import { TxFeedback } from "./tx-feedback"

const WHOLE = /^\d{1,3}$/

function Count() {
  const { app, locale } = useAppCopy()
  const c = app.count
  const demo = useDemo()!
  const stand = getStand(DEMO_STAND_ID)!
  const products = standProducts(demo, stand.id).filter((p) => p.active || p.stock > 0)
  const [counted, setCounted] = useState<Record<string, string>>({})
  const countTx = useTx()
  const withdrawTx = useTx()
  const [withdrawn, setWithdrawn] = useState(0)

  const rows = products.map((p) => {
    const raw = counted[p.id] ?? String(p.stock)
    const valid = WHOLE.test(raw.trim())
    const n = valid ? Number(raw) : p.stock
    return { p, raw, valid, n, diff: n - p.stock }
  })
  const missing = rows.filter((r) => r.diff < 0)
  const missingN = missing.reduce((s, r) => s - r.diff, 0)
  const missingValue = missing.reduce((s, r) => s - r.diff * r.p.price, 0)
  const extra = rows.some((r) => r.diff > 0)
  const invalid = rows.some((r) => !r.valid)
  const takings = demo.takings[stand.id] ?? 0
  const history = demo.ledger.filter((e) => e.standId === stand.id && e.kind === "count").slice(0, 5)

  const set = (id: string, v: string) => {
    if (countTx.state.phase !== "idle" && !countTx.busy) countTx.reset()
    setCounted((s) => ({ ...s, [id]: v }))
  }

  const record = async () => {
    if (invalid) return
    const snapshot = Object.fromEntries(rows.map((r) => [r.p.id, r.n]))
    const ok = await countTx.run(
      {
        title: c.recordTitle,
        account: "farmer",
        to: stand.contract,
        toLabel: stand.name,
        lines: [{ label: c.summaryTitle, value: missingN > 0 ? t(c.missing, { n: missingN, value: tusdc(missingValue, locale) }) : c.match }],
        movesFunds: false,
      },
      (hash) => recordCount(stand.id, snapshot, hash)
    )
    if (ok) setCounted({})
  }

  const doWithdraw = async () => {
    const out = { amount: 0 }
    const ok = await withdrawTx.run(
      {
        title: c.withdrawTx,
        account: "farmer",
        to: stand.owner,
        toLabel: app.wallet.accounts.farmer,
        lines: [{ label: app.prompt.from, value: stand.name }],
        amount: takings,
        movesFunds: true,
      },
      (hash) => withdraw(stand.id, hash, out)
    )
    if (ok) setWithdrawn(out.amount)
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <Link href={href(locale, "/app/farm")} className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {c.back}
      </Link>
      <h1 className="mt-3 flex items-center gap-1 text-3xl sm:text-4xl">
        {c.title}
        <InfoTip label={c.infoLabel}>{c.info}</InfoTip>
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <section aria-labelledby="count-title" className="min-w-0 rounded-lg border bg-card">
          <h2 id="count-title" className="sr-only">
            {c.summaryTitle}
          </h2>
          <div className="hidden grid-cols-[1fr_5rem_10rem_minmax(9rem,12rem)] gap-3 border-b px-5 py-2 text-xs font-semibold text-muted-foreground md:grid">
            <span />
            <span className="text-right">{c.expected}</span>
            <span className="text-center">{c.counted}</span>
            <span>{c.variance}</span>
          </div>
          <ul className="divide-y">
            {rows.map(({ p, raw, valid, n, diff }) => {
              const name = p.name[locale]
              return (
                <li key={p.id} className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 md:grid-cols-[1fr_5rem_10rem_minmax(9rem,12rem)] md:px-5 md:py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ProduceBadge icon={p.icon} tone={p.tone} className="size-10" iconClassName="size-5" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {c.expected}: <span className="font-semibold text-foreground tnum">{p.stock}</span>
                      </p>
                    </div>
                  </div>
                  <p className="hidden text-right font-display text-xl font-bold tnum md:block">{p.stock}</p>
                  <div className="flex items-center gap-1">
                    <Button size="icon-sm" variant="outline" aria-label={`${name} −1`} disabled={countTx.busy || n <= 0} onClick={() => set(p.id, String(Math.max(0, n - 1)))}>
                      <Minus aria-hidden="true" />
                    </Button>
                    <Input
                      inputMode="numeric"
                      aria-label={t(c.countedLabel, { product: name })}
                      aria-invalid={!valid || undefined}
                      value={raw}
                      onChange={(e) => set(p.id, e.target.value)}
                      disabled={countTx.busy}
                      className="h-9 w-14 text-center tnum"
                    />
                    <Button size="icon-sm" variant="outline" aria-label={`${name} +1`} disabled={countTx.busy || n >= 999} onClick={() => set(p.id, String(n + 1))}>
                      <Plus aria-hidden="true" />
                    </Button>
                  </div>
                  <p
                    aria-live="polite"
                    className={cn(
                      "col-span-2 text-sm font-semibold md:col-span-1",
                      !valid ? "text-destructive" : diff < 0 ? "text-destructive" : diff > 0 ? "text-warning" : "text-success"
                    )}
                  >
                    {!valid ? (
                      app.farm.errors.stock
                    ) : diff < 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-sm bg-destructive/10 px-2 py-0.5">
                        <TriangleAlert className="size-3.5" aria-hidden="true" />
                        {t(c.missing, { n: -diff, value: tusdc(-diff * p.price, locale) })}
                      </span>
                    ) : diff > 0 ? (
                      t(c.extra, { n: diff })
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Check className="size-4" aria-hidden="true" />
                        {c.match}
                      </span>
                    )}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="summary-title" className="rounded-lg border bg-card p-4 sm:p-5">
            <h2 id="summary-title" className="text-xl">
              {c.summaryTitle}
            </h2>
            <p className={cn("mt-2 text-sm font-semibold", missingN > 0 ? "text-destructive" : "text-success")} aria-live="polite">
              {missingN > 0 ? t(c.summaryMissing, { n: missingN, value: tusdc(missingValue, locale) }) : c.summaryClean}
            </p>
            {extra && <p className="mt-2 text-sm text-warning">{c.summaryExtra}</p>}
            <Button size="lg" className="mt-4 w-full" onClick={record} disabled={invalid || countTx.busy}>
              {c.record}
            </Button>
            <TxFeedback className="mt-3" state={countTx.state} confirmed={c.recorded} failed={{ reverted: c.recordFailed }} onRetry={record} onDismiss={countTx.reset} />
          </section>

          <section aria-labelledby="withdraw-title" className="rounded-lg border bg-card p-4 sm:p-5">
            <h2 id="withdraw-title" className="flex items-center gap-2 text-xl">
              <Landmark className="size-5 text-success" aria-hidden="true" />
              {c.withdrawTitle}
            </h2>
            <p key={takings} className="bz-roll mt-3 font-display text-3xl font-bold tnum">
              {tusdc(takings, locale)}
            </p>
            {takings > 0 ? (
              <Button size="lg" variant="outline" className="mt-4 w-full" onClick={doWithdraw} disabled={withdrawTx.busy}>
                {t(c.withdraw, { amount: tusdc(takings, locale) })}
              </Button>
            ) : (
              withdrawTx.state.phase !== "confirmed" && <p className="mt-3 text-sm text-muted-foreground">{c.nothing}</p>
            )}
            <TxFeedback
              className="mt-3"
              state={withdrawTx.state}
              confirmed={t(c.withdrawn, { amount: tusdc(withdrawn, locale) })}
              onRetry={takings > 0 ? doWithdraw : undefined}
              onDismiss={withdrawTx.reset}
            />
          </section>

          <section aria-labelledby="history-title" className="rounded-lg border border-dashed border-input p-4 sm:p-5">
            <h2 id="history-title" className="text-lg">
              {c.history}
            </h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{c.historyEmpty}</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {history.map((e) =>
                  e.kind === "count" ? (
                    <li key={e.id} className={e.missing > 0 ? "text-foreground" : "text-muted-foreground"}>
                      {e.missing > 0 ? t(c.historyLine, { date: shortDate(e.at, locale), n: e.missing, value: tusdc(e.missingValue, locale) }) : `${shortDate(e.at, locale)} · ${c.match}`}
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

/** Flow 4: count the shelf, see what went unpaid, record it and withdraw the takings. */
export function CountView() {
  return (
    <OwnerGate>
      <Count />
    </OwnerGate>
  )
}
