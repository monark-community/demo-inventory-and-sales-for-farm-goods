"use client"

import { FAUCET_AMOUNT, REWARD_VALUE, SHOPPER_ADDRESS, STAMP_MIN, STAMPS_PER_CARD, getStand } from "./catalog"
import { newId, randomAddress, randomHash } from "./ids"
import { effectivePrice, markdownActive, standNow } from "./pricing"
import { getDemo, setWallet, update } from "./store"
import type { AccountRole, Cents, CountLine, DemoState, FailReason, LedgerEntry, Product, Sale, SaleLine } from "./types"

/**
 * The stand contract, simulated. Each function here is what a contract call
 * would do on confirmation; they run inside useTx's `execute` so they always
 * see the latest state (another shopper may have bought in the meantime).
 */

/* ---------------------------------------------------------------- queries */

export function standProducts(s: DemoState, standId: string): Product[] {
  return s.products.filter((p) => p.standId === standId)
}

export function isMarkdownOn(s: DemoState, standId: string): boolean {
  const stand = getStand(standId)
  return !!stand && markdownActive(stand, standNow(s.settings.clockOffsetMin))
}

export function basketLines(s: DemoState, standId: string): SaleLine[] {
  const basket = s.basket[standId] ?? {}
  const on = isMarkdownOn(s, standId)
  return Object.entries(basket)
    .filter(([, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = s.products.find((p) => p.id === productId)
      return product ? { productId, qty, unitPrice: effectivePrice(product, on) } : null
    })
    .filter((l): l is SaleLine => l !== null)
}

export function linesTotal(lines: SaleLine[]): Cents {
  return lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0)
}

export function rewardDiscount(s: DemoState, standId: string, subtotal: Cents, useReward: boolean): Cents {
  if (!useReward || (s.rewards[standId] ?? 0) < 1) return 0
  return Math.min(REWARD_VALUE, subtotal)
}

/** Products at or under their alert threshold (active products only). */
export function lowStock(s: DemoState, standId: string): Product[] {
  return standProducts(s, standId).filter((p) => p.active && p.stock <= p.lowAt)
}

export function startOfDay(ms = Date.now()): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function salesToday(s: DemoState, standId: string): Sale[] {
  const today = startOfDay()
  return s.sales.filter((x) => x.standId === standId && x.at >= today)
}

export function findSale(s: DemoState, hash: string): Sale | undefined {
  const h = hash.trim().toLowerCase()
  return s.sales.find((x) => x.hash.toLowerCase() === h)
}

/* ---------------------------------------------------------------- basket */

export function setBasketQty(standId: string, productId: string, qty: number) {
  update((s) => {
    const product = s.products.find((p) => p.id === productId)
    const max = product ? Math.min(product.stock, product.maxPerOrder) : 0
    const next = Math.max(0, Math.min(qty, max))
    const basket = { ...(s.basket[standId] ?? {}) }
    if (next === 0) delete basket[productId]
    else basket[productId] = next
    return { ...s, basket: { ...s.basket, [standId]: basket } }
  })
}

export function clearBasket(standId: string) {
  update((s) => ({ ...s, basket: { ...s.basket, [standId]: {} } }))
}

/* ---------------------------------------------------------------- helpers */

function recordSale(s: DemoState, sale: Sale): DemoState {
  const alerts: LedgerEntry[] = []
  const products = s.products.map((p) => {
    const line = sale.lines.find((l) => l.productId === p.id)
    if (!line) return p
    const stock = p.stock - line.qty
    if (stock <= p.lowAt && p.stock > p.lowAt) {
      alerts.push({ id: newId("la"), standId: sale.standId, at: sale.at + 1, kind: "alert", productId: p.id, stock })
    }
    return { ...p, stock }
  })
  const entry: LedgerEntry = { id: newId("l"), standId: sale.standId, at: sale.at, kind: "sale", saleId: sale.id, hash: sale.hash }
  return {
    ...s,
    products,
    sales: [sale, ...s.sales],
    ledger: [...alerts, entry, ...s.ledger],
    takings: { ...s.takings, [sale.standId]: (s.takings[sale.standId] ?? 0) + sale.total },
  }
}

function ownerCheck(s: DemoState, standId: string): FailReason | null {
  const stand = getStand(standId)
  if (!stand?.demoOwned || s.wallet.status !== "connected" || s.wallet.account !== "farmer") return "owner"
  return null
}

/** A passer-by (not the visitor) buys 1–2 in-stock items. Used by the race and the demo controls. */
function passerbySale(s: DemoState, standId: string, forceProductId?: string, forceQty?: number): DemoState {
  const on = isMarkdownOn(s, standId)
  const inStock = standProducts(s, standId).filter((p) => p.active && p.stock > 0)
  if (inStock.length === 0) return s
  const picks = forceProductId
    ? inStock.filter((p) => p.id === forceProductId)
    : [...inStock].sort(() => Math.random() - 0.5).slice(0, Math.random() < 0.5 ? 1 : 2)
  const lines = picks.map((p) => ({ productId: p.id, qty: Math.min(p.stock, forceQty ?? 1), unitPrice: effectivePrice(p, on) }))
  const total = linesTotal(lines)
  const sale: Sale = {
    id: newId("sale"),
    standId,
    lines,
    subtotal: total,
    discount: 0,
    total,
    buyer: randomAddress(),
    hash: randomHash(),
    block: s.nextBlock,
    at: Date.now(),
    mine: false,
  }
  return recordSale({ ...s, nextBlock: s.nextBlock + 1 }, sale)
}

/* ---------------------------------------------------------------- contract calls */

export interface PurchaseResult {
  sale?: Sale
  stampAdded: boolean
  cardFilled: boolean
}

/**
 * Pay for the basket. Reverts with "stock" if any line exceeds the stock at
 * confirmation time (the basket is clamped to what's left), or "funds".
 */
export function purchase(standId: string, useReward: boolean, hash: string, block: number, out: PurchaseResult): FailReason | null {
  let failure: FailReason | null = null
  update((s0) => {
    let s = s0
    // "Another shopper buys first": someone takes the first basket item, leaving less than asked.
    if (s.settings.raceNext) {
      const first = basketLines(s, standId)[0]
      const product = first && s.products.find((p) => p.id === first.productId)
      s = { ...s, settings: { ...s.settings, raceNext: false } }
      if (first && product && product.stock > 0) {
        const take = Math.max(1, product.stock - first.qty + 1)
        s = passerbySale(s, standId, product.id, take)
      }
    }
    const lines = basketLines(s, standId)
    const short = lines.filter((l) => (s.products.find((p) => p.id === l.productId)?.stock ?? 0) < l.qty)
    if (short.length > 0) {
      failure = "stock"
      const basket = { ...(s.basket[standId] ?? {}) }
      for (const l of short) {
        const left = s.products.find((p) => p.id === l.productId)?.stock ?? 0
        if (left <= 0) delete basket[l.productId]
        else basket[l.productId] = left
      }
      return { ...s, basket: { ...s.basket, [standId]: basket } }
    }
    const subtotal = linesTotal(lines)
    const discount = rewardDiscount(s, standId, subtotal, useReward)
    const total = subtotal - discount
    if (lines.length === 0) {
      failure = "reverted"
      return s
    }
    if (s.balances.shopper < total) {
      failure = "funds"
      return s
    }
    const sale: Sale = { id: newId("sale"), standId, lines, subtotal, discount, total, buyer: SHOPPER_ADDRESS, hash, block, at: Date.now(), mine: true }
    s = recordSale(s, sale)
    let stamps = s.stamps[standId] ?? 0
    let rewards = s.rewards[standId] ?? 0
    if (discount > 0) {
      rewards -= 1
      stamps = 0
    }
    const stampAdded = total >= STAMP_MIN && stamps < STAMPS_PER_CARD
    if (stampAdded) stamps += 1
    const cardFilled = stampAdded && stamps === STAMPS_PER_CARD
    if (cardFilled) rewards += 1
    out.sale = sale
    out.stampAdded = stampAdded
    out.cardFilled = cardFilled
    return {
      ...s,
      balances: { ...s.balances, shopper: s.balances.shopper - total },
      stamps: { ...s.stamps, [standId]: stamps },
      rewards: { ...s.rewards, [standId]: rewards },
      basket: { ...s.basket, [standId]: {} },
    }
  })
  return failure
}

/** Test-token faucet for the shopper wallet. */
export function faucet(): FailReason | null {
  update((s) => ({ ...s, balances: { ...s.balances, shopper: s.balances.shopper + FAUCET_AMOUNT } }))
  return null
}

export type ShelfChange = Partial<Pick<Product, "price" | "stock" | "lowAt" | "markdownPct" | "active">>

/** Publish a batch of shelf edits (owner only). */
export function publishShelf(standId: string, changes: Record<string, ShelfChange>, hash: string): FailReason | null {
  const s0 = getDemo()
  if (!s0) return "reverted"
  const denied = ownerCheck(s0, standId)
  if (denied) return denied
  update((s) => ({
    ...s,
    products: s.products.map((p) => (p.standId === standId && changes[p.id] ? { ...p, ...changes[p.id] } : p)),
    ledger: [{ id: newId("l"), standId, at: Date.now(), kind: "shelf", changes: Object.keys(changes).length, hash }, ...s.ledger],
  }))
  return null
}

/** Record the evening shelf count: stock becomes what was counted; shortfalls are logged. */
export function recordCount(standId: string, counted: Record<string, number>, hash: string): FailReason | null {
  const s0 = getDemo()
  if (!s0) return "reverted"
  const denied = ownerCheck(s0, standId)
  if (denied) return denied
  update((s) => {
    const lines: CountLine[] = standProducts(s, standId).map((p) => ({ productId: p.id, expected: p.stock, counted: counted[p.id] ?? p.stock, price: p.price }))
    const missingLines = lines.filter((l) => l.counted < l.expected)
    const missing = missingLines.reduce((n, l) => n + (l.expected - l.counted), 0)
    const missingValue = missingLines.reduce((n, l) => n + (l.expected - l.counted) * l.price, 0)
    const at = Date.now()
    return {
      ...s,
      products: s.products.map((p) => (p.standId === standId && counted[p.id] !== undefined ? { ...p, stock: counted[p.id]! } : p)),
      counts: [{ id: newId("count"), standId, at, hash, lines }, ...s.counts],
      ledger: [{ id: newId("l"), standId, at, kind: "count", missing, missingValue, hash }, ...s.ledger],
    }
  })
  return null
}

/** Move the stand's takings to the farm wallet (owner only). */
export function withdraw(standId: string, hash: string, out: { amount: Cents }): FailReason | null {
  const s0 = getDemo()
  if (!s0) return "reverted"
  const denied = ownerCheck(s0, standId)
  if (denied) return denied
  const amount = s0.takings[standId] ?? 0
  if (amount <= 0) return "reverted"
  out.amount = amount
  update((s) => ({
    ...s,
    balances: { ...s.balances, farmer: s.balances.farmer + amount },
    takings: { ...s.takings, [standId]: 0 },
    ledger: [{ id: newId("l"), standId, at: Date.now(), kind: "withdraw", amount, hash }, ...s.ledger],
  }))
  return null
}

/** Demo control: a passer-by buys something at the stand right now. */
export function simulatePasserby(standId: string): Sale | null {
  let sale: Sale | null = null
  update((s) => {
    const next = passerbySale(s, standId)
    sale = next.sales[0] && next.sales[0] !== s.sales[0] ? next.sales[0] : null
    return next
  })
  return sale
}

/* ---------------------------------------------------------------- wallet */

export function switchAccount(account: AccountRole) {
  setWallet({ account, lastError: null })
}
