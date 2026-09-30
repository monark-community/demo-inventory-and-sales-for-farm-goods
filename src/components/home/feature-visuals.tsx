import { BellRing, CheckCircle2, CircleSlash, Sunset } from "lucide-react"

import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { money } from "@/lib/format"
import { cn } from "@/lib/utils"

type V = Dictionary["home"]["features"]["visual"]

/** Small built-in visuals, one per home feature (keyed by dict.home.features.items[].visual). */
export function FeatureVisual({ kind, locale, v }: { kind: string; locale: Locale; v: V }) {
  const shell = "flex h-24 items-center justify-center gap-3 rounded-md border bg-paper px-3"
  switch (kind) {
    case "paid":
      return (
        <div className={cn(shell, "flex-col gap-1.5 text-sm")} aria-hidden="true">
          <span className="inline-flex items-center gap-1.5 font-semibold text-success">
            <CheckCircle2 className="size-4" /> {v.paid} · {money(1800, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-destructive">
            <CircleSlash className="size-4" /> {v.reverted}
          </span>
        </div>
      )
    case "markdown":
      return (
        <div className={shell} aria-hidden="true">
          <span className="tag-notch bg-accent py-1.5 pr-3 pl-5 font-display text-xl font-bold text-accent-foreground">
            <span className="mr-2 text-base text-accent-foreground/70 line-through">{money(500, locale)}</span>
            {money(350, locale)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Sunset className="size-4" /> {v.after}
          </span>
        </div>
      )
    case "count":
      return (
        <div className={cn(shell, "justify-between text-sm")} aria-hidden="true">
          <span className="grid grid-cols-2 gap-x-3 gap-y-0.5 tnum">
            <span className="text-muted-foreground">14</span>
            <span className="font-semibold">12</span>
          </span>
          <span className="rounded-sm bg-destructive/10 px-2 py-1 font-semibold text-destructive">{v.missing} · {money(900, locale)}</span>
        </div>
      )
    default:
      return (
        <div className={shell} aria-hidden="true">
          <span className="inline-flex items-center gap-2 rounded-full border border-warning/50 bg-accent/30 px-3 py-1.5 text-sm font-semibold">
            <BellRing className="size-4 text-warning" /> {v.alert}
          </span>
        </div>
      )
  }
}
