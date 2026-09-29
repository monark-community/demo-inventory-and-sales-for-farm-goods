/**
 * Domain types for the Bazarius demo. Amounts are integer cents of tUSDC
 * (a 2-decimal testnet dollar), so there is never float drift in a basket.
 */

export type DemoLocale = "en" | "fr"
export type L10n = Record<DemoLocale, string>
export type Address = `0x${string}`
export type Cents = number

export type ProduceIcon =
  | "tomato"
  | "corn"
  | "egg"
  | "greens"
  | "garlic"
  | "syrup"
  | "zucchini"
  | "apple"
  | "cider"
  | "pumpkin"
  | "jar"
  | "carrot"
  | "kale"
  | "herbs"
  | "honey"
  | "flowers"

export type CrateTone = "beet" | "leaf" | "marigold" | "soil" | "slate"

export interface Stand {
  id: string
  name: string
  farmer: string
  place: L10n
  blurb: L10n
  /** Local time after which evening markdowns apply, "HH:MM". */
  markdownFrom: string
  owner: Address
  contract: Address
  distanceKm: number
  /** Only this stand is owned by the demo's farm wallet. */
  demoOwned: boolean
}

export interface Product {
  id: string
  standId: string
  name: L10n
  unit: L10n
  icon: ProduceIcon
  tone: CrateTone
  price: Cents
  stock: number
  /** A purchase that brings stock to or below this fires a low-stock alert. */
  lowAt: number
  maxPerOrder: number
  /** Evening markdown in percent (0 = none). */
  markdownPct: number
  active: boolean
}

export interface SaleLine {
  productId: string
  qty: number
  unitPrice: Cents
}

export interface Sale {
  id: string
  standId: string
  lines: SaleLine[]
  subtotal: Cents
  discount: Cents
  total: Cents
  buyer: Address
  hash: string
  block: number
  at: number
  /** Bought by the visitor's shopper wallet (shows in their receipts). */
  mine: boolean
}

export type LedgerEntry =
  | { id: string; standId: string; at: number; kind: "sale"; saleId: string; hash: string }
  | { id: string; standId: string; at: number; kind: "alert"; productId: string; stock: number }
  | { id: string; standId: string; at: number; kind: "shelf"; changes: number; hash: string }
  | { id: string; standId: string; at: number; kind: "count"; missing: number; missingValue: Cents; hash: string }
  | { id: string; standId: string; at: number; kind: "withdraw"; amount: Cents; hash: string }

export interface CountLine {
  productId: string
  expected: number
  counted: number
  price: Cents
}

export interface CountRecord {
  id: string
  standId: string
  at: number
  hash: string
  lines: CountLine[]
}

export type AccountRole = "shopper" | "farmer"

export interface WalletState {
  status: "disconnected" | "connecting" | "connected"
  account: AccountRole
  lastError: "rejected" | null
}

export interface DemoSettings {
  failNext: boolean
  /** Another shopper buys first: the next purchase meets less stock than it expected. */
  raceNext: boolean
  slow: boolean
  /** Minutes added to the visitor's clock to get the stand clock. */
  clockOffsetMin: number
}

export interface DemoState {
  version: 1
  wallet: WalletState
  balances: Record<AccountRole, Cents>
  takings: Record<string, Cents>
  products: Product[]
  sales: Sale[]
  ledger: LedgerEntry[]
  counts: CountRecord[]
  stamps: Record<string, number>
  rewards: Record<string, number>
  basket: Record<string, Record<string, number>>
  nextBlock: number
  settings: DemoSettings
}

/** What the simulated wallet shows before asking to confirm or reject. */
export interface TxSummary {
  title: string
  account: AccountRole
  to?: Address
  toLabel?: string
  lines: { label: string; value: string }[]
  amount?: Cents
  /** Show the value-moving disclaimer (anything that moves funds). */
  movesFunds: boolean
}

export type FailReason = "rejected" | "reverted" | "stock" | "funds" | "owner"

export type TxState =
  | { phase: "idle" }
  | { phase: "signing" }
  | { phase: "pending"; hash: string }
  | { phase: "confirmed"; hash: string; block: number }
  | { phase: "failed"; reason: FailReason; hash?: string }
