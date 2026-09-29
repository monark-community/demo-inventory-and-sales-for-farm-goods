"use client"

import { Clock, RotateCcw, ShoppingBasket, SlidersHorizontal } from "lucide-react"
import { useId } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { t } from "@/i18n/t"
import { DEMO_STAND_ID } from "@/lib/demo/catalog"
import { simulatePasserby } from "@/lib/demo/ops"
import { offsetTo, standNow } from "@/lib/demo/pricing"
import { resetDemo, setSettings, useDemo, useStorageOk } from "@/lib/demo/store"
import type { DemoSettings } from "@/lib/demo/types"
import { time } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { useNow } from "./use-now"

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      </div>
      <Switch id={id} aria-describedby={`${id}-hint`} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

/** Bend the simulation: force failures, races, slow blocks, the stand clock; reset. */
export function DemoControls() {
  const { app, locale, close } = useAppCopy()
  const demo = useDemo()
  const storageOk = useStorageOk()
  const now = useNow(30_000)
  const c = app.controls
  if (!demo) return null
  const s = demo.settings
  const set = (patch: Partial<DemoSettings>) => setSettings(patch)
  const clock = now ? standNow(s.clockOffsetMin, now) : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label={c.open} title={c.open}>
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={close}>
        <DialogHeader>
          <DialogTitle className="text-xl">{c.title}</DialogTitle>
          <DialogDescription>{c.body}</DialogDescription>
        </DialogHeader>
        <div className="divide-y divide-dashed divide-input">
          <Toggle label={c.failNext} hint={c.failNextHint} checked={s.failNext} onChange={(v) => set({ failNext: v })} />
          <Toggle label={c.raceNext} hint={c.raceNextHint} checked={s.raceNext} onChange={(v) => set({ raceNext: v })} />
          <Toggle label={c.slow} hint={c.slowHint} checked={s.slow} onChange={(v) => set({ slow: v })} />
          <div className="py-3">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
              {c.clock}
            </p>
            <p className="text-xs text-muted-foreground">{clock ? t(c.clockNow, { time: time(clock, locale) }) : " "}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => set({ clockOffsetMin: offsetTo("17:30") })}>
                {c.jumpEvening}
              </Button>
              <Button size="sm" variant="ghost" disabled={s.clockOffsetMin === 0} onClick={() => set({ clockOffsetMin: 0 })}>
                {c.backToNow}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 py-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const sale = simulatePasserby(DEMO_STAND_ID)
                toast(sale ? c.passerbyDone : c.passerbyNone)
              }}
            >
              <ShoppingBasket aria-hidden="true" />
              {c.passerby}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                resetDemo()
                toast(c.resetDone)
              }}
            >
              <RotateCcw aria-hidden="true" />
              {c.reset}
            </Button>
          </div>
        </div>
        {!storageOk && <p className="rounded-md border border-warning/40 bg-accent/20 p-2.5 text-xs">{c.storageOff}</p>}
      </DialogContent>
    </Dialog>
  )
}
