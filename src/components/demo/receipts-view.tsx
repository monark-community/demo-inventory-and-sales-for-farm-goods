"use client"

import { CheckCircle2, ChevronDown, Loader2, SearchCheck, Store, Wallet, XCircle } from "lucide-react"
import Link from "next/link"
import { useId, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { href } from "@/i18n/config"
import { plural, t } from "@/i18n/t"
import { getStand, stands } from "@/lib/demo/catalog"
import { isTxHash } from "@/lib/demo/ids"
import { findSale, switchAccount } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { DemoState, Sale } from "@/lib/demo/types"
import { dateTime, num, tusdc } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { ReceiptCard } from "./receipt-card"
import { StampCard } from "./stamp-card"
import { useConnect } from "./use-connect"

const CHECK_MS = 900

function ReceiptRow({ sale, demo }: { sale: Sale; demo: DemoState }) {
  const { app, locale } = useAppCopy()
  const r = app.receipts
  const [open, setOpen] = useState(false)
  const [check, setCheck] = useState<"idle" | "checking" | "ok">("idle")
  const panelId = useId()
  const stand = getStand(sale.standId)
  const items = sale.lines.reduce((n, l) => n + l.qty, 0)

  const verify = () => {
    setCheck("checking")
    window.setTimeout(() => setCheck(findSale(demo, sale.hash) ? "ok" : "idle"), CHECK_MS)
  }

  return (
    <li className="rounded-lg border bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Store className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{stand?.name}</span>
          <span className="block text-sm text-muted-foreground">
            {dateTime(sale.at, locale)} · {plural(items, r.items)}
          </span>
        </span>
        <span className="font-display text-lg font-bold tnum">{tusdc(sale.total, locale)}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
        <span className="sr-only">{open ? r.hide : r.open}</span>
      </button>
      {open && (
        <div id={panelId} className="space-y-3 border-t border-dashed border-input p-4">
          <ReceiptCard sale={sale} demo={demo} className="max-w-md" />
          <div aria-live="polite" className="space-y-2">
            {check === "ok" ? (
              <p className="flex items-start gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {t(r.verified, { block: num(sale.block, locale) })}
              </p>
            ) : (
              <Button size="sm" variant="outline" onClick={verify} disabled={check === "checking"}>
                {check === "checking" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <SearchCheck aria-hidden="true" />}
                {check === "checking" ? r.verifying : r.verify}
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

function VerifyForm({ demo }: { demo: DemoState }) {
  const { app, locale } = useAppCopy()
  const r = app.receipts
  const id = useId()
  const [value, setValue] = useState("")
  const [state, setState] = useState<{ kind: "idle" | "checking" | "invalid" | "missing" } | { kind: "found"; sale: Sale }>({ kind: "idle" })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!isTxHash(value)) {
      setState({ kind: "invalid" })
      return
    }
    setState({ kind: "checking" })
    window.setTimeout(() => {
      const sale = findSale(demo, value)
      setState(sale ? { kind: "found", sale } : { kind: "missing" })
    }, CHECK_MS)
  }

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-lg border bg-card p-5">
      <h2 id={`${id}-title`} className="text-xl">
        {r.verifyTitle}
      </h2>
      <form onSubmit={submit} noValidate className="mt-4 space-y-2">
        <Label htmlFor={id}>{r.verifyLabel}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={id}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={r.verifyPlaceholder}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={state.kind === "invalid" || undefined}
            aria-describedby={`${id}-msg`}
            className="h-10 font-mono text-xs"
          />
          <Button type="submit" variant="outline" disabled={state.kind === "checking"}>
            {state.kind === "checking" && <Loader2 className="animate-spin" aria-hidden="true" />}
            {r.verifyButton}
          </Button>
        </div>
        <div id={`${id}-msg`} aria-live="polite" className="text-sm">
          {state.kind === "invalid" && <p className="text-destructive">{r.verifyInvalid}</p>}
          {state.kind === "checking" && <p className="text-muted-foreground">{r.verifying}</p>}
          {state.kind === "missing" && (
            <p className="flex items-start gap-2 font-medium text-destructive">
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {r.verifyNotFound}
            </p>
          )}
          {state.kind === "found" && (
            <p className="flex items-start gap-2 font-medium text-success">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {t(r.verifyFound, { total: tusdc(state.sale.total, locale), stand: getStand(state.sale.standId)?.name ?? "", block: num(state.sale.block, locale) })}
            </p>
          )}
        </div>
      </form>
    </section>
  )
}

/** Flow 2: the shopper's receipts, stamp cards and receipt verification. */
export function ReceiptsView() {
  const { app, locale } = useAppCopy()
  const r = app.receipts
  const demo = useDemo()
  const connect = useConnect()

  if (!demo) return <div className="container-page py-10" aria-busy="true"><div className="h-64 animate-pulse rounded-lg bg-muted" /></div>

  const { status, account } = demo.wallet
  const mine = demo.sales.filter((s) => s.mine)

  let body
  if (status !== "connected") {
    body = (
      <div className="rounded-lg border border-dashed border-input p-6">
        <p className="text-muted-foreground">{r.connect}</p>
        <Button className="mt-4" onClick={() => void connect("shopper")} disabled={status === "connecting"}>
          <Wallet aria-hidden="true" />
          {status === "connecting" ? app.wallet.connecting : app.wallet.connect}
        </Button>
        {demo.wallet.lastError === "rejected" && <p className="mt-3 text-sm text-destructive">{app.wallet.rejected}</p>}
      </div>
    )
  } else if (account !== "shopper") {
    body = (
      <div className="rounded-lg border border-dashed border-input p-6">
        <p className="text-muted-foreground">{r.connect}</p>
        <Button className="mt-4" variant="outline" onClick={() => switchAccount("shopper")}>
          {t(app.wallet.switchTo, { name: app.wallet.accounts.shopper })}
        </Button>
      </div>
    )
  } else {
    body = (
      <div className="space-y-10">
        <section aria-labelledby="cards-title">
          <h2 id="cards-title" className="text-xl">
            {r.cardsTitle}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stands.map((s) => (
              <li key={s.id}>
                <StampCard name={s.name} stamps={demo.stamps[s.id] ?? 0} reward={(demo.rewards[s.id] ?? 0) > 0} />
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="list-title">
          <h2 id="list-title" className="text-xl">
            {r.listTitle}
          </h2>
          {mine.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-input p-6">
              <p className="text-muted-foreground">{r.empty}</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href={href(locale, "/app")}>{r.emptyCta}</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {mine.map((sale) => (
                <ReceiptRow key={sale.id} sale={sale} demo={demo} />
              ))}
            </ul>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="container-page grid gap-10 py-8 lg:grid-cols-[1fr_22rem] lg:py-12">
      <div>
        <h1 className="text-3xl sm:text-4xl">{r.title}</h1>
        <div className="mt-8">{body}</div>
      </div>
      <aside>
        <VerifyForm demo={demo} />
      </aside>
    </div>
  )
}
