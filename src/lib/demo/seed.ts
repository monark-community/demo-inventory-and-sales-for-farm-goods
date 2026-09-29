import { FARMER_ADDRESS, initialProducts, SHOPPER_ADDRESS } from "./catalog"
import { randomAddress, randomHash } from "./ids"
import type { DemoState, LedgerEntry, Product, Sale } from "./types"

/**
 * The demo's starting state, rebuilt relative to "now" so the day's sales are
 * always earlier today (or on previous days) whatever the visitor's clock.
 */

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

type Plan = { standId: string; ago: number; items: [string, number][]; mine?: boolean }

const PLAN: Plan[] = [
  // Earlier days (already withdrawn / counted).
  { standId: "verger-beaulieu", ago: 6 * DAY + 3 * HOUR, items: [["honeycrisp", 1], ["cider", 1]], mine: true },
  { standId: "trois-erables", ago: 3 * DAY + 2 * HOUR, items: [["corn", 1], ["tomatoes", 2]], mine: true },
  // Today at Trois Érables (these are the takings waiting to be withdrawn).
  { standId: "trois-erables", ago: 6 * HOUR + 10 * MIN, items: [["tomatoes", 1], ["eggs", 1]] },
  { standId: "trois-erables", ago: 5 * HOUR + 20 * MIN, items: [["corn", 1]] },
  { standId: "trois-erables", ago: 4 * HOUR + 45 * MIN, items: [["garlic", 1]] },
  { standId: "trois-erables", ago: 3 * HOUR + 30 * MIN, items: [["eggs", 1], ["greens", 1]] },
  { standId: "trois-erables", ago: 2 * HOUR + 5 * MIN, items: [["tomatoes", 1], ["corn", 1]] },
  { standId: "trois-erables", ago: 1 * HOUR + 15 * MIN, items: [["syrup", 1], ["eggs", 1]] },
  // Today at the other stands.
  { standId: "verger-beaulieu", ago: 4 * HOUR, items: [["honeycrisp", 2], ["pumpkins", 1]] },
  { standId: "verger-beaulieu", ago: 50 * MIN, items: [["cider", 1]] },
  { standId: "jardins-riviere", ago: 2 * HOUR + 40 * MIN, items: [["honey", 1], ["herbs", 1]] },
]

export function startOfToday(now = Date.now()): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function createSeed(): DemoState {
  const now = Date.now()
  const today = startOfToday(now)
  const products: Product[] = initialProducts.map((p) => ({ ...p }))
  const byId = new Map(products.map((p) => [p.id, p]))
  let block = 18_204_331 - 40_000
  const sales: Sale[] = []
  const ledger: LedgerEntry[] = []
  const takings: Record<string, number> = {}

  for (const [i, plan] of PLAN.entries()) {
    // Don't place "today" sales before midnight if the visitor opens the demo very early.
    const at = plan.ago < DAY ? Math.max(now - plan.ago, today + (i + 1) * 7 * MIN) : now - plan.ago
    const lines = plan.items.map(([productId, qty]) => ({ productId, qty, unitPrice: byId.get(productId)!.price }))
    const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
    block += 2_000 + Math.floor(Math.random() * 3_000)
    const sale: Sale = {
      id: `seed_${i}`,
      standId: plan.standId,
      lines,
      subtotal,
      discount: 0,
      total: subtotal,
      buyer: plan.mine ? SHOPPER_ADDRESS : randomAddress(),
      hash: randomHash(),
      block,
      at,
      mine: !!plan.mine,
    }
    sales.push(sale)
    ledger.push({ id: `l_${sale.id}`, standId: sale.standId, at, kind: "sale", saleId: sale.id, hash: sale.hash })
    const isToday = at >= today
    if (isToday) {
      takings[plan.standId] = (takings[plan.standId] ?? 0) + subtotal
      for (const l of lines) {
        const product = byId.get(l.productId)!
        product.stock -= l.qty
        if (product.stock <= product.lowAt && product.stock + l.qty > product.lowAt) {
          ledger.push({ id: `la_${sale.id}_${l.productId}`, standId: plan.standId, at: at + 1, kind: "alert", productId: l.productId, stock: product.stock })
        }
      }
    }
  }

  // Yesterday's close at Trois Érables: a count (one tomato basket missing) and a withdrawal.
  const yesterdayClose = today - 4 * HOUR
  ledger.push({ id: "l_count_y", standId: "trois-erables", at: yesterdayClose, kind: "count", missing: 1, missingValue: 450, hash: randomHash() })
  ledger.push({ id: "l_withdraw_y", standId: "trois-erables", at: yesterdayClose + 6 * MIN, kind: "withdraw", amount: 11_850, hash: randomHash() })

  ledger.sort((a, b) => b.at - a.at)
  sales.sort((a, b) => b.at - a.at)

  return {
    version: 1,
    wallet: { status: "disconnected", account: "shopper", lastError: null },
    balances: { shopper: 4_250, farmer: 128_460 },
    takings,
    products,
    sales,
    ledger,
    counts: [],
    stamps: { "trois-erables": 5, "verger-beaulieu": 2, "jardins-riviere": 0 },
    rewards: {},
    basket: {},
    nextBlock: 18_204_331,
    settings: { failNext: false, raceNext: false, slow: false, clockOffsetMin: 0 },
  }
}

export { FARMER_ADDRESS, SHOPPER_ADDRESS }
