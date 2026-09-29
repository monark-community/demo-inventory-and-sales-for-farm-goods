"use client"

import { Wallet } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { TxStatus } from "@/components/ui/tx-status"
import { t } from "@/i18n/t"
import type { FailReason, TxState } from "@/lib/demo/types"
import { num } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

interface Props {
  state: TxState
  /** Message shown on confirmation (defaults to the generic "Confirmed"). */
  confirmed?: ReactNode
  /** Override the failure message for a reason (e.g. a flow-specific wording). */
  failed?: Partial<Record<FailReason, string>>
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

/** Inline, announced status for one transaction: signing, pending, confirmed or failed. */
export function TxFeedback({ state, confirmed, failed, onRetry, onDismiss, className }: Props) {
  const { app, locale } = useAppCopy()
  const x = app.tx
  if (state.phase === "idle") return <div role="status" aria-live="polite" className="sr-only" />

  return (
    <div role="status" aria-live="polite" className={cn("space-y-2", className)}>
      {state.phase === "signing" && (
        <p className="flex items-center gap-2 rounded-md border bg-paper px-3 py-2.5 text-sm">
          <Wallet className="size-4 shrink-0 text-primary" aria-hidden="true" />
          {x.signing}
        </p>
      )}
      {state.phase === "pending" && (
        <TxStatus status="pending" hash={state.hash} label={x.pending} />
      )}
      {state.phase === "confirmed" && (
        <div className="space-y-2">
          <TxStatus status="confirmed" hash={state.hash} label={`${x.confirmed} · ${t(x.block, { n: num(state.block, locale) })}`} />
          {confirmed && <p className="text-sm font-medium text-success">{confirmed}</p>}
        </div>
      )}
      {state.phase === "failed" && (
        <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
          {state.hash ? (
            <TxStatus status="failed" hash={state.hash} label={x.failed} className="bg-card" />
          ) : null}
          <p className="text-sm font-medium text-destructive">{failed?.[state.reason] ?? x.reasons[state.reason]}</p>
          {(onRetry || onDismiss) && (
            <div className="flex flex-wrap gap-2">
              {onRetry && (
                <Button size="sm" onClick={onRetry}>
                  {x.tryAgain}
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  {x.dismiss}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
