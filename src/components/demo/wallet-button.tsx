"use client"

import { ArrowLeftRight, ChevronDown, LogOut } from "lucide-react"

import { ConnectWallet } from "@/components/ui/connect-wallet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { switchAccount } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { AccountRole } from "@/lib/demo/types"
import { addressOf, disconnectWallet } from "@/lib/demo/wallet"
import { tusdc } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { useConnect } from "./use-connect"

/** Wallet control in the app bar: connect (as the page's role), or the account menu. */
export function WalletButton({ preferred }: { preferred: AccountRole }) {
  const { app, locale } = useAppCopy()
  const demo = useDemo()
  const connect = useConnect()
  const w = app.wallet
  if (!demo) return <div className="h-10 w-36 rounded-md bg-muted" aria-hidden="true" />

  const { status, account } = demo.wallet
  if (status !== "connected") {
    return (
      <ConnectWallet
        status={status}
        onConnect={() => void connect(preferred)}
        connectLabel={<span className="hidden sm:inline">{w.connect}</span>}
        connectingLabel={w.connecting}
        aria-label={w.connect}
        className="h-10"
      />
    )
  }

  const other: AccountRole = account === "farmer" ? "shopper" : "farmer"
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={w.menu}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-input bg-card px-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <WalletAvatar address={addressOf(account)} size={26} />
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="max-w-36 truncate text-xs font-semibold">{w.accounts[account]}</span>
          <span className="text-[0.6875rem] text-muted-foreground tnum">{tusdc(demo.balances[account], locale)}</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-0.5">
          <span className="block text-sm font-semibold">{w.accounts[account]}</span>
          <WalletAddress address={addressOf(account)} className="block text-xs font-normal text-muted-foreground" />
          <span className="block text-xs font-normal text-muted-foreground">
            {w.balance}: <span className="font-semibold text-foreground tnum">{tusdc(demo.balances[account], locale)}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => switchAccount(other)}>
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          {t(w.switchTo, { name: w.accounts[other] })}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => disconnectWallet()}>
          <LogOut className="size-4" aria-hidden="true" />
          {w.disconnect}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
