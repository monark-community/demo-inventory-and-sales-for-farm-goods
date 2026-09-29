"use client"

import { ArrowRight, BellRing, CircleOff } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { DEMO_STAND_ID, getStand } from "@/lib/demo/catalog"
import { lowStock, salesToday, startOfDay } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import { num, tusdc } from "@/lib/format"
import { DESKTOP, useMediaQuery } from "@/lib/use-media-query"

import { useAppCopy } from "./app-provider"
import { LedgerItem } from "./ledger-item"
import { OwnerGate } from "./owner-gate"
import { ShelfEditor, type ShelfEditorHandle } from "./shelf-editor"
import { StandSign } from "./stand-sign"

function Dashboard({ origin }: { origin: string }) {
  const { app, locale } = useAppCopy()
  const f = app.farm
  const demo = useDemo()!
  const stand = getStand(DEMO_STAND_ID)!
  const editor = useRef<ShelfEditorHandle>(null)
  const desktop = useMediaQuery(DESKTOP)
  const [initial] = useState(() => new Set(demo.ledger.map((e) => e.id)))

  const sales = salesToday(demo, stand.id)
  const items = sales.reduce((n, s) => n + s.lines.reduce((m, l) => m + l.qty, 0), 0)
  const alerts = lowStock(demo, stand.id)
  const today = startOfDay()
  const ledger = demo.ledger.filter((e) => e.standId === stand.id)
  const ledgerToday = ledger.filter((e) => e.at >= today)
  const ledgerEarlier = ledger.filter((e) => e.at < today).slice(0, 4)

  const stats = [
    { label: f.stats.takings, value: tusdc(demo.takings[stand.id] ?? 0, locale), big: true },
    { label: f.stats.sales, value: num(sales.length, locale) },
    { label: f.stats.items, value: num(items, locale) },
    { label: f.stats.wallet, value: tusdc(demo.balances.farmer, locale) },
  ]

  // Alerts come first on phones (above the long shelf editor), in the side column on desktop.
  const alertsBox = (
    <section aria-labelledby="alerts-title" className="rounded-lg border bg-card p-4 sm:p-5">
      <h2 id="alerts-title" className="flex items-center gap-2 text-xl">
        <BellRing className="size-5 text-warning" aria-hidden="true" />
        {f.alertsTitle}
      </h2>
      {alerts.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{f.alertsEmpty}</p>
      ) : (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {alerts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-warning/40 bg-accent/20 p-2.5 text-sm">
              <span className="flex items-center gap-2 font-medium">
                {p.stock === 0 && <CircleOff className="size-4 text-muted-foreground" aria-hidden="true" />}
                {p.stock === 0 ? t(f.alertSoldOut, { product: p.name[locale] }) : t(f.alertLine, { product: p.name[locale], n: p.stock, at: p.lowAt })}
              </span>
              <Button size="sm" variant="outline" onClick={() => editor.current?.restock(p.id)}>
                {f.restock}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )

  return (
    <div className="container-page py-8 lg:py-10">
      <p className="eyebrow text-primary">{f.eyebrow}</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">{f.title}</h1>
      <p className="mt-2 text-muted-foreground">{t(f.standLine, { stand: stand.name, place: stand.place[locale] })}</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={s.big ? "rounded-lg border border-primary/40 bg-primary/5 p-4" : "rounded-lg border bg-card p-4"}>
            <dt className="text-xs font-semibold text-muted-foreground sm:text-sm">{s.label}</dt>
            <dd key={s.value} className="bz-roll mt-1 font-display text-xl font-bold tnum sm:text-2xl">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-8">
          {!desktop && alertsBox}
          <ShelfEditor ref={editor} standId={stand.id} demo={demo} />
          <section className="flex flex-col gap-4 rounded-lg border border-dashed border-input p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl">{f.closeDay}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.closeDayBody}</p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href={href(locale, "/app/farm/count")}>
                {f.closeDay}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </section>
        </div>

        <aside className="space-y-6">
          {desktop && alertsBox}

          <section aria-labelledby="ledger-title" className="rounded-lg border bg-card p-4 sm:p-5">
            <h2 id="ledger-title" className="flex items-center justify-between gap-2 text-xl">
              {f.ledgerTitle}
              <span className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-success">
                <span className="size-2 rounded-full bg-success" aria-hidden="true" />
                {f.ledgerLive}
              </span>
            </h2>
            <h3 className="eyebrow mt-4 font-sans text-muted-foreground">{app.ledger.today}</h3>
            {ledgerToday.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{app.ledger.empty}</p>
            ) : (
              <ol className="mt-2 space-y-2" aria-live="polite">
                {ledgerToday.slice(0, 12).map((e) => (
                  <LedgerItem key={e.id} entry={e} demo={demo} fresh={!initial.has(e.id)} compact />
                ))}
              </ol>
            )}
            {ledgerEarlier.length > 0 && (
              <>
                <h3 className="eyebrow mt-5 font-sans text-muted-foreground">{app.ledger.earlier}</h3>
                <ol className="mt-2 space-y-2 opacity-80">
                  {ledgerEarlier.map((e) => (
                    <LedgerItem key={e.id} entry={e} demo={demo} compact />
                  ))}
                </ol>
              </>
            )}
          </section>

          <StandSign stand={stand} url={`${origin}/${locale}/app/stand/${stand.id}`} />
        </aside>
      </div>
    </div>
  )
}

/** Flow 3 and the grower's day: takings, alerts, live ledger, shelf editor and stand sign. */
export function FarmView({ origin }: { origin: string }) {
  return (
    <OwnerGate>
      <Dashboard origin={origin} />
    </OwnerGate>
  )
}
