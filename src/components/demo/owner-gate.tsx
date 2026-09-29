"use client"

import { ArrowLeftRight, LockKeyhole, Wallet } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { switchAccount } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"

import { useAppCopy } from "./app-provider"
import { useConnect } from "./use-connect"

/** Grower pages: only the stand owner's wallet gets in (roles enforced by the stand contract). */
export function OwnerGate({ children }: { children: ReactNode }) {
  const { app } = useAppCopy()
  const f = app.farm
  const demo = useDemo()
  const connect = useConnect()

  if (!demo) {
    return (
      <div className="container-page py-10" aria-busy="true">
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="mt-6 h-80 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  const { status, account, lastError } = demo.wallet
  if (status === "connected" && account === "farmer") return <>{children}</>

  const notOwner = status === "connected"
  return (
    <div className="container-page flex flex-1 items-start justify-center py-12 sm:py-20">
      <section className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-crate-sm sm:p-8" aria-labelledby="gate-title">
        <LockKeyhole className="size-8 text-primary" aria-hidden="true" />
        <p className="eyebrow mt-4 text-primary">{f.eyebrow}</p>
        <h1 id="gate-title" className="mt-2 text-2xl sm:text-3xl">
          {notOwner ? f.notOwnerTitle : f.gateTitle}
        </h1>
        <p className="mt-3 text-muted-foreground">{notOwner ? f.notOwnerBody : f.gateBody}</p>
        {notOwner ? (
          <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={() => switchAccount("farmer")}>
            <ArrowLeftRight aria-hidden="true" />
            {f.notOwnerCta}
          </Button>
        ) : (
          <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={() => void connect("farmer")} disabled={status === "connecting"}>
            <Wallet aria-hidden="true" />
            {status === "connecting" ? app.wallet.connecting : f.gateConnect}
          </Button>
        )}
        {lastError === "rejected" && !notOwner && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {app.wallet.rejected}
          </p>
        )}
      </section>
    </div>
  )
}
