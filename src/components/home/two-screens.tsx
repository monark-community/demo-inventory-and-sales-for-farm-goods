import { BellRing, ReceiptText } from "lucide-react"

import { LogoMark } from "@/components/brand/logo"
import { ProduceBadge } from "@/components/produce/produce-icon"
import type { Dictionary } from "@/i18n"
import { t } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { initialProducts } from "@/lib/demo/catalog"
import { clockLabel, money } from "@/lib/format"

const shelf = ["tomatoes", "eggs", "greens"]
const stockNow: Record<string, number> = { tomatoes: 14, eggs: 3, greens: 11 }

/** Static preview of the two sides of one stand, in the demo's own visual language. */
export function TwoScreens({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const s = dict.home.screens
  const a = dict.app
  const products = initialProducts.filter((p) => shelf.includes(p.id))
  const eggs = products.find((p) => p.id === "eggs")!
  const tomatoes = products.find((p) => p.id === "tomatoes")!
  const ledger = [
    { time: "15:42", icon: "sale", text: t(a.ledger.sale, { items: `2 × ${tomatoes.name[locale]}, 1 × ${eggs.name[locale]}` }), amount: 1550 },
    { time: "15:42", icon: "alert", text: t(a.ledger.alert, { product: eggs.name[locale], n: 3 }) },
    { time: "14:05", icon: "sale", text: t(a.ledger.sale, { items: `1 × ${tomatoes.name[locale]}` }), amount: 450 },
  ] as const

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="eyebrow mb-3 text-muted-foreground">{s.atStand}</p>
        <div className="rounded-lg border bg-card p-4 shadow-crate-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <LogoMark className="size-6" />
            <span className="font-display text-lg font-bold">Ferme des Trois Érables</span>
          </div>
          <ul className="mt-3 space-y-2">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-md border bg-paper p-2.5">
                <ProduceBadge icon={p.icon} tone={p.tone} className="size-10" iconClassName="size-5" />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate font-semibold">{p.name[locale]}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.unit[locale]} · {t(a.stand.left, { n: stockNow[p.id] ?? 0 })}
                  </p>
                </div>
                <span className="font-display text-lg font-bold tnum">{money(p.price, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex h-11 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground">
            {t(a.basket.pay, { amount: `${money(1550, locale)} tUSDC` })}
          </div>
        </div>
      </div>
      <div>
        <p className="eyebrow mb-3 text-muted-foreground">{s.atFarm}</p>
        <div className="rounded-lg border bg-card p-4 shadow-crate-sm">
          <div className="flex items-baseline justify-between border-b pb-3">
            <span className="font-display text-lg font-bold">{a.rail.takings}</span>
            <span className="font-display text-2xl font-bold tnum">{money(9300, locale)}</span>
          </div>
          <ol className="mt-3 space-y-2">
            {ledger.map((e, i) => (
              <li key={i} className={e.icon === "alert" ? "flex gap-3 rounded-md border border-warning/40 bg-accent/25 p-2.5" : "flex gap-3 rounded-md border bg-paper p-2.5"}>
                {e.icon === "alert" ? (
                  <BellRing className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                ) : (
                  <ReceiptText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                )}
                <p className="min-w-0 flex-1 text-sm leading-snug">
                  <span className="mr-2 text-muted-foreground tnum">{clockLabel(e.time, locale)}</span>
                  {e.text}
                </p>
                {"amount" in e && <span className="text-sm font-semibold tnum">+{money(e.amount, locale)}</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
