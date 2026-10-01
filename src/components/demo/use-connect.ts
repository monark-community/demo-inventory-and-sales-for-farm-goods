"use client"

import { useCallback } from "react"

import type { AccountRole } from "@/lib/demo/types"
import { connectWallet } from "@/lib/demo/wallet"

import { useAppCopy } from "./app-provider"

/** Connect the simulated wallet as the given account, through the wallet prompt. */
export function useConnect() {
  const { app } = useAppCopy()
  return useCallback(
    (account: AccountRole) =>
      connectWallet(account, {
        title: app.wallet.signInTitle,
        account,
        lines: [{ label: app.wallet.signInLine, value: app.wallet.signInValue }],
        movesFunds: false,
      }),
    [app]
  )
}
