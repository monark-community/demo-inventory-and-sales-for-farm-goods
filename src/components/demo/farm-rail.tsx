"use client"

import { useState } from "react"

import { getStand } from "@/lib/demo/catalog"
import { salesToday, startOfDay } from "@/lib/demo/ops"
import type { DemoState } from "@/lib/demo/types"
import { tusdc } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { LedgerItem } from "./ledger-item"

/** "Meanwhile at the farm": the grower's view of this stand, printing each new sale as it lands. */
export function FarmRail({ standId, demo }: { standId: string; demo: DemoState }) {
  const { app, locale } = useAppCopy()
  const r = app.rail
  const stand = getStand(standId)!
  // Entries present on first render don't animate; anything newer prints in.
  const [initial] = useState(() => new Set(demo.ledger.map((e) => e.id)))
  const today = startOfDay()
  const entries = demo.ledger.filter((e) => e.standId === standId && e.at >= today && (e.kind === "sale" || e.kind === "alert")).slice(0, 4)
  const takings = salesToday(demo, standId).reduce((n, s) => n + s.total, 0)

  return (
    <section aria-labelledby="rail-title" className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-crate-leaf font-display text-sm font-bold">
          {stand.farmer
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
        <div className="min-w-0">
          <h2 id="rail-title" className="text-lg leading-tight">
            {r.title}
          </h2>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between rounded-md bg-muted px-3 py-2">
        <span className="text-sm font-semibold">{r.takings}</span>
        <span key={takings} className="bz-roll font-display text-xl font-bold tnum">
          {tusdc(takings, locale)}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{r.empty}</p>
      ) : (
        <ol className="mt-3 space-y-2" aria-live="polite">
          {entries.map((e) => (
            <LedgerItem key={e.id} entry={e} demo={demo} fresh={!initial.has(e.id)} compact />
          ))}
        </ol>
      )}
    </section>
  )
}
