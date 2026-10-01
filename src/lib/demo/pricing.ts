import type { Cents, Product, Stand } from "./types"

/** Minutes since midnight for "HH:MM". */
export function toMinutes(hhmm: string): number {
  const [h = "0", m = "0"] = hhmm.split(":")
  return Number(h) * 60 + Number(m)
}

/** The stand's clock: the visitor's clock plus the demo offset. */
export function standNow(offsetMin: number, now = Date.now()): Date {
  return new Date(now + offsetMin * 60_000)
}

export function markdownActive(stand: Pick<Stand, "markdownFrom">, clock: Date): boolean {
  return clock.getHours() * 60 + clock.getMinutes() >= toMinutes(stand.markdownFrom)
}

/** Price a buyer pays right now: evening markdown applies after the stand's markdown hour. */
export function effectivePrice(product: Product, markdownOn: boolean): Cents {
  if (!markdownOn || product.markdownPct <= 0) return product.price
  return Math.round((product.price * (100 - product.markdownPct)) / 100)
}

/** Minutes to add to "now" so the stand clock reads the given "HH:MM" today. */
export function offsetTo(hhmm: string, now = new Date()): number {
  return toMinutes(hhmm) - (now.getHours() * 60 + now.getMinutes())
}
