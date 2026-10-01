"use client"

import { Gift } from "lucide-react"

import { InfoTip } from "@/components/ui/info-tip"
import { t } from "@/i18n/t"
import { STAMPS_PER_CARD } from "@/lib/demo/catalog"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

/** Per-stand stamp card: six punches, then a reward. The newest punch pops in. */
export function StampCard({ stamps, reward, name, justPunched, className }: { stamps: number; reward: boolean; name?: string; justPunched?: boolean; className?: string }) {
  const { app } = useAppCopy()
  const s = app.stamps
  return (
    <div className={cn("rounded-md border border-dashed border-input bg-paper p-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center text-sm font-semibold">
          {name ?? s.title}
          <InfoTip label={s.hintLabel} className="-my-1.5 size-7">
            {s.hint}
          </InfoTip>
        </p>
        <p className="text-xs text-muted-foreground tnum">{t(s.progress, { n: stamps })}</p>
      </div>
      <ol className="mt-2 flex gap-1.5" aria-label={t(s.progress, { n: stamps })}>
        {Array.from({ length: STAMPS_PER_CARD }, (_, i) => {
          const filled = i < stamps
          return (
            <li
              key={i}
              aria-hidden="true"
              className={cn(
                "flex size-7 items-center justify-center rounded-full border-2",
                filled ? "border-primary bg-primary text-primary-foreground" : "border-dashed border-input",
                filled && justPunched && i === stamps - 1 && "bz-punch"
              )}
            >
              {filled && <span className="size-2 rounded-full bg-background" />}
            </li>
          )
        })}
      </ol>
      {reward && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-success">
          <Gift className="size-3.5" aria-hidden="true" />
          {s.ready}
        </p>
      )}
    </div>
  )
}
