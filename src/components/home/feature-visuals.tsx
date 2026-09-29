import { BellRing, CheckCircle2, CircleSlash, Sunset } from "lucide-react"

import { ProduceBadge } from "@/components/produce/produce-icon"
import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { money } from "@/lib/format"
import { cn } from "@/lib/utils"

type V = Dictionary["home"]["features"]["visual"]

/** Small built-in visuals, one per feature (order matches dict.home.features.items). */
export function FeatureVisual({ index, locale, v }: { index: number; locale: Locale; v: V }) {
  const shell = "flex h-24 items-center justify-center gap-3 rounded-md border bg-paper px-3"
  switch (index) {
    case 0:
      return (
        <div className={shell} aria-hidden="true">
          <ProduceBadge icon="tomato" tone="beet" className="size-10" iconClassName="size-5" />
          <span className="font-display text-3xl font-bold tnum text-muted-foreground line-through decoration-2">14</span>
          <span className="font-display text-3xl font-bold tnum">13</span>
          <span className="text-sm text-muted-foreground">{v.left}</span>
        </div>
      )
    case 1:
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
    case 2:
      return (
        <div className={shell} aria-hidden="true">
          <span className="inline-flex items-center gap-2 rounded-full border border-warning/50 bg-accent/30 px-3 py-1.5 text-sm font-semibold">
            <BellRing className="size-4 text-warning" /> {v.alert}
          </span>
        </div>
      )
    case 3:
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
    case 4:
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
        <div className={cn(shell, "flex-col gap-2")} aria-hidden="true">
          <span className="flex gap-1.5">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className={cn("size-6 rounded-full border-2", i < 5 ? "border-primary bg-primary" : "border-dashed border-input")} />
            ))}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">{v.stamps}</span>
        </div>
      )
  }
}
