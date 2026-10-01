"use client"

import { Printer, Smartphone } from "lucide-react"

import { LogoMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import type { Stand } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"
import { QrCode } from "./qr-code"

/** The printable stand sign with a real QR code to the stand's shelf. */
export function StandSign({ stand, url }: { stand: Stand; url: string }) {
  const { app } = useAppCopy()
  const f = app.farm
  return (
    <section aria-labelledby="sign-title" className="rounded-lg border bg-card p-4 sm:p-5">
      <h2 id="sign-title" className="text-xl">
        {f.signTitle}
      </h2>
      <div className="print-area mx-auto mt-4 max-w-72 rounded-md border-2 border-foreground bg-paper p-4 text-center text-foreground">
        <div className="flex items-center justify-center gap-2">
          <LogoMark className="size-7" />
          <span className="font-display text-xl font-bold">Bazarius</span>
        </div>
        <p className="mt-2 font-display text-lg leading-tight font-bold">{stand.name}</p>
        <p className="eyebrow mt-3 text-primary">{f.signScan}</p>
        <QrCode value={url} label={f.signQrLabel} className="mx-auto mt-2 w-full max-w-52" />
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
          <Smartphone className="size-4" aria-hidden="true" />
          {f.signPay}
        </p>
      </div>
      <Button variant="outline" className="mt-4 w-full" onClick={() => window.print()}>
        <Printer aria-hidden="true" />
        {f.signPrint}
      </Button>
    </section>
  )
}
