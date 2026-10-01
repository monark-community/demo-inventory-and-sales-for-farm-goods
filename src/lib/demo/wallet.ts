"use client"

import { FARMER_ADDRESS, SHOPPER_ADDRESS } from "./catalog"
import { getDemo, requestSignature, setWallet } from "./store"
import type { AccountRole, Address, TxSummary } from "./types"

/**
 * Simulated wallet with two accounts (the visitor's shopper wallet and Élise's
 * farm wallet), so one visitor can play both sides of the stand. Connecting
 * signs a message in the wallet prompt; rejecting leaves it disconnected.
 */

export function addressOf(account: AccountRole): Address {
  return account === "farmer" ? FARMER_ADDRESS : SHOPPER_ADDRESS
}

export async function connectWallet(account: AccountRole, summary: TxSummary): Promise<boolean> {
  const demo = getDemo()
  if (!demo || demo.wallet.status === "connecting") return false
  setWallet({ status: "connecting", account, lastError: null })
  const ok = await requestSignature(summary)
  if (!ok) {
    setWallet({ status: "disconnected", lastError: "rejected" })
    return false
  }
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 500))
  setWallet({ status: "connected", account, lastError: null })
  return true
}

export function disconnectWallet() {
  setWallet({ status: "disconnected", lastError: null })
}
