"use client"

import { ShieldAlert } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { estimateFee } from "@/lib/demo/chain"
import { usePrompt } from "@/lib/demo/store"
import { addressOf } from "@/lib/demo/wallet"
import { tusdc } from "@/lib/format"

import { useAppCopy } from "./app-provider"

/** The simulated wallet's confirmation sheet: every connection and transaction goes through it. */
export function WalletPrompt() {
  const { app, locale, valueNotice } = useAppCopy()
  const request = usePrompt()
  const p = app.prompt
  const summary = request?.summary
  const fee = useMemo(() => (summary ? estimateFee() : ""), [summary])

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && request?.resolve(false)}>
      {summary && (
        <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-sm">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
            <span className="text-sm font-semibold">{p.title}</span>
            <NetworkBadge name={app.network} variant="subtle" icon={<span className="block size-full rounded-full bg-chart-5" />} />
          </div>
          <div className="space-y-4 px-5 py-5">
            <div>
              <DialogTitle className="text-xl">{summary.title}</DialogTitle>
              <DialogDescription className="sr-only">{p.subtitle}</DialogDescription>
            </div>
            <div className="flex items-center gap-3 rounded-md border bg-paper p-3">
              <WalletAvatar address={addressOf(summary.account)} size={32} />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold">{app.wallet.accounts[summary.account]}</p>
                <WalletAddress address={addressOf(summary.account)} className="text-xs text-muted-foreground" />
              </div>
            </div>
            <dl className="divide-y divide-dashed divide-input rounded-md border bg-card text-sm">
              {summary.toLabel && (
                <div className="flex justify-between gap-4 px-3 py-2">
                  <dt className="text-muted-foreground">{p.to}</dt>
                  <dd className="text-right">
                    <span className="block font-medium">{summary.toLabel}</span>
                    {summary.to && <WalletAddress address={summary.to} className="text-xs text-muted-foreground" />}
                  </dd>
                </div>
              )}
              {summary.lines.map((line) => (
                <div key={line.label} className="flex justify-between gap-4 px-3 py-2">
                  <dt className="text-muted-foreground">{line.label}</dt>
                  <dd className="text-right font-medium">{line.value}</dd>
                </div>
              ))}
              {summary.amount !== undefined && (
                <div className="flex items-baseline justify-between gap-4 px-3 py-2.5">
                  <dt className="font-semibold">{p.amount}</dt>
                  <dd className="font-display text-xl font-bold tnum">{tusdc(summary.amount, locale)}</dd>
                </div>
              )}
              {summary.movesFunds || summary.amount !== undefined ? (
                <div className="flex justify-between gap-4 px-3 py-2 text-xs">
                  <dt className="text-muted-foreground">{p.fee}</dt>
                  <dd className="text-muted-foreground tnum">{t(p.feeValue, { fee })}</dd>
                </div>
              ) : null}
            </dl>
            {summary.movesFunds && (
              <p className="flex gap-2 rounded-md border border-warning/40 bg-accent/20 p-2.5 text-xs font-medium">
                <ShieldAlert className="size-4 shrink-0 text-warning" aria-hidden="true" />
                {valueNotice}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 border-t px-5 py-4">
            <Button variant="outline" size="lg" onClick={() => request?.resolve(false)}>
              {p.reject}
            </Button>
            <Button size="lg" onClick={() => request?.resolve(true)} autoFocus>
              {p.confirm}
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
