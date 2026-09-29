"use client"

import { useCallback, useRef, useState } from "react"

import { randomHash } from "./ids"
import { getDemo, requestSignature, setSettings, update } from "./store"
import type { FailReason, TxState, TxSummary } from "./types"

/**
 * Simulated chain (Base Sepolia). A transaction is: wallet prompt (confirm or
 * reject) -> pending with a hash for a realistic block time -> the contract
 * call runs -> confirmed, or failed with a reason. "Fail the next transaction"
 * in the demo controls forces one network revert.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function blockTime(): number {
  const slow = getDemo()?.settings.slow
  const [min, max] = slow ? [3000, 6000] : [1200, 2400]
  return Math.round(min + Math.random() * (max - min))
}

function nextBlock(): number {
  const n = getDemo()?.nextBlock ?? 18_204_331
  update((s) => ({ ...s, nextBlock: s.nextBlock + 1 + Math.floor(Math.random() * 3) }))
  return n
}

export interface RunOptions {
  /** Skip the wallet prompt (e.g. a transaction someone else sends). */
  skipPrompt?: boolean
}

/**
 * One transaction's lifecycle for a component. `execute` is the contract call:
 * it runs at confirmation time against the latest state and returns a failure
 * reason when the contract would revert (e.g. stock changed), or null.
 */
export function useTx() {
  const [state, setState] = useState<TxState>({ phase: "idle" })
  const busy = useRef(false)

  const run = useCallback(
    async (summary: TxSummary, execute: (hash: string, block: number) => FailReason | null, options: RunOptions = {}) => {
      if (busy.current) return false
      busy.current = true
      try {
        if (!options.skipPrompt) {
          setState({ phase: "signing" })
          const ok = await requestSignature(summary)
          if (!ok) {
            setState({ phase: "failed", reason: "rejected" })
            return false
          }
        }
        const hash = randomHash()
        setState({ phase: "pending", hash })
        await sleep(blockTime())
        if (getDemo()?.settings.failNext) {
          setSettings({ failNext: false })
          setState({ phase: "failed", reason: "reverted", hash })
          return false
        }
        const block = nextBlock()
        const failure = execute(hash, block)
        if (failure) {
          setState({ phase: "failed", reason: failure, hash })
          return false
        }
        setState({ phase: "confirmed", hash, block })
        return true
      } finally {
        busy.current = false
      }
    },
    []
  )

  const reset = useCallback(() => setState({ phase: "idle" }), [])

  return { state, run, reset, busy: state.phase === "signing" || state.phase === "pending" }
}

/** Estimated network fee shown in the wallet prompt (sponsored, simulated in tETH). */
export function estimateFee(): string {
  return (0.000012 + Math.random() * 0.000009).toFixed(6)
}
