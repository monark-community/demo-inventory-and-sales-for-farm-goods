"use client"

import { ArrowLeftRight, Coins, ShoppingBasket, Wallet } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { href } from "@/i18n/config"
import { plural, t } from "@/i18n/t"
import { FAUCET_ADDRESS, FAUCET_AMOUNT, getStand, SHOPPER_ADDRESS } from "@/lib/demo/catalog"
import type { useTx } from "@/lib/demo/chain"
import { basketLines, clearBasket, faucet, linesTotal, purchase, rewardDiscount, switchAccount, type PurchaseResult } from "@/lib/demo/ops"
import { getDemo } from "@/lib/demo/store"
import type { DemoState } from "@/lib/demo/types"
import { money, tusdc } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { ReceiptCard, StampLine } from "./receipt-card"
import { TxFeedback } from "./tx-feedback"
import { useConnect } from "./use-connect"

type Tx = ReturnType<typeof useTx>

interface Props {
  standId: string
  demo: DemoState
  tx: Tx
  faucetTx: Tx
  result: PurchaseResult | null
  onPurchased: (r: PurchaseResult) => void
  onDone: () => void
}

/** Basket, payment and receipt for one stand. State lives in StandView so it survives the mobile sheet. */
export function Checkout({ standId, demo, tx, faucetTx, result, onPurchased, onDone }: Props) {
  const { app, locale } = useAppCopy()
  const b = app.basket
  const connect = useConnect()
  const stand = getStand(standId)!
  const [useReward, setUseReward] = useState(true)
  const name = (id: string) => demo.products.find((p) => p.id === id)?.name[locale] ?? id

  // Receipt after a confirmed purchase.
  if (tx.state.phase === "confirmed" && result?.sale) {
    const sale = demo.sales.find((s) => s.id === result.sale!.id) ?? result.sale
    return (
      <div className="space-y-4">
        <TxFeedback state={tx.state} />
        <ReceiptCard
          sale={sale}
          demo={demo}
          stampIn
          headline={<p className="mb-3 pr-24 text-sm font-semibold text-success">{app.receipt.title}</p>}
        />
        <StampLine added={result.stampAdded} filled={result.cardFilled} stamps={demo.stamps[standId] ?? 0} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Button onClick={onDone}>
            {app.receipt.again}
          </Button>
          <Button asChild variant="outline">
            <Link href={href(locale, "/app/receipts")}>{app.receipt.all}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const lines = basketLines(demo, standId)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = linesTotal(lines)
  const hasReward = (demo.rewards[standId] ?? 0) > 0
  const discount = rewardDiscount(demo, standId, subtotal, useReward)
  const total = subtotal - discount
  const { status, account } = demo.wallet
  const connected = status === "connected"
  const asFarmer = connected && account === "farmer"
  const short = connected && account === "shopper" && demo.balances.shopper < total
  const busy = tx.busy || faucetTx.busy

  const pay = async () => {
    if (getDemo()?.wallet.status !== "connected") {
      const ok = await connect("shopper")
      if (!ok) return
    }
    const s = getDemo()
    if (!s || s.wallet.account !== "shopper") return
    const now = basketLines(s, standId)
    const sub = linesTotal(now)
    const disc = rewardDiscount(s, standId, sub, useReward)
    if (s.balances.shopper < sub - disc) return
    const out: PurchaseResult = { stampAdded: false, cardFilled: false }
    const ok = await tx.run(
      {
        title: t(b.payTitle, { stand: stand.name }),
        account: "shopper",
        to: stand.contract,
        toLabel: stand.name,
        lines: [
          { label: b.lineItems, value: plural(now.reduce((n, l) => n + l.qty, 0), b.items) },
          ...(disc > 0 ? [{ label: b.reward, value: `−${tusdc(disc, locale)}` }] : []),
        ],
        amount: sub - disc,
        movesFunds: true,
      },
      (hash, block) => purchase(standId, useReward, hash, block, out)
    )
    if (ok) onPurchased(out)
  }

  const topUp = async () => {
    const ok = await faucetTx.run(
      {
        title: b.faucetTitle,
        account: "shopper",
        to: SHOPPER_ADDRESS,
        toLabel: app.wallet.accounts.shopper,
        lines: [{ label: app.prompt.from, value: `${b.faucetFrom} (${FAUCET_ADDRESS.slice(0, 6)}…)` }],
        amount: FAUCET_AMOUNT,
        movesFunds: true,
      },
      () => faucet()
    )
    if (ok) toast(b.toppedUp)
  }

  return (
    <div className="space-y-4">
      {lines.length === 0 ? (
        <p className="flex items-start gap-3 rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
          <ShoppingBasket className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          {b.empty}
        </p>
      ) : (
        <>
          <ul className="space-y-1.5 text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-3">
                <span>
                  {l.qty} × {name(l.productId)}
                </span>
                <span className="tnum">{money(l.qty * l.unitPrice, locale)}</span>
              </li>
            ))}
          </ul>
          {hasReward && (
            <label className="flex items-center justify-between gap-3 rounded-md border border-success/40 bg-success/5 p-3 text-sm font-semibold">
              {b.useReward}
              <Switch checked={useReward} onCheckedChange={setUseReward} disabled={busy} />
            </label>
          )}
          <dl className="space-y-1 border-t border-dashed border-input pt-3 text-sm">
            {discount > 0 && (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{b.subtotal}</dt>
                  <dd className="tnum">{money(subtotal, locale)}</dd>
                </div>
                <div className="flex justify-between text-success">
                  <dt>{b.reward}</dt>
                  <dd className="tnum">−{money(discount, locale)}</dd>
                </div>
              </>
            )}
            <div className="flex items-baseline justify-between">
              <dt className="font-semibold">
                {b.total} <span className="font-normal text-muted-foreground">· {plural(count, b.items)}</span>
              </dt>
              <dd className="font-display text-2xl font-bold tnum">{tusdc(total, locale)}</dd>
            </div>
          </dl>

          {short && (
            <div className="space-y-2 rounded-md border border-warning/40 bg-accent/20 p-3 text-sm">
              <p className="font-medium">{t(b.funds, { balance: tusdc(demo.balances.shopper, locale) })}</p>
              <Button size="sm" variant="outline" onClick={topUp} disabled={busy}>
                <Coins aria-hidden="true" />
                {b.topUp}
              </Button>
              <TxFeedback state={faucetTx.state} onDismiss={faucetTx.reset} />
            </div>
          )}

          {asFarmer ? (
            <Button size="lg" variant="outline" className="w-full" onClick={() => switchAccount("shopper")}>
              <ArrowLeftRight aria-hidden="true" />
              {b.switchToShopper}
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={pay} disabled={busy || short}>
              {!connected && <Wallet aria-hidden="true" />}
              {connected ? t(b.pay, { amount: tusdc(total, locale) }) : b.connectFirst}
            </Button>
          )}
        </>
      )}

      <TxFeedback state={tx.state} onRetry={tx.state.phase === "failed" && tx.state.reason !== "stock" && lines.length > 0 ? pay : undefined} onDismiss={tx.reset} />
      {demo.wallet.lastError === "rejected" && !connected && <p className="text-sm text-destructive">{app.wallet.rejected}</p>}

      {lines.length > 0 && !busy && (
        <Button variant="ghost" size="sm" onClick={() => clearBasket(standId)} className="text-muted-foreground">
          {b.clear}
        </Button>
      )}
    </div>
  )
}
