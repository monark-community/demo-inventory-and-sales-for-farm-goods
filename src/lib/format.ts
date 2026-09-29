import { intlLocale, type Locale } from "@/i18n/config"

/** 450 -> "4.50" (en) / "4,50" (fr). */
export function money(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100)
}

/** 450 -> "4.50 tUSDC" with a non-breaking space. */
export function tusdc(cents: number, locale: Locale): string {
  return `${money(cents, locale)} tUSDC`
}

export function num(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(n)
}

export function time(ms: number | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { hour: "numeric", minute: "2-digit" }).format(ms)
}

export function dateTime(ms: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(ms)
}

export function shortDate(ms: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", month: "short", day: "numeric" }).format(ms)
}

/** "HH:MM" stand setting -> localized time ("5:00 p.m." / "17 h 00"). */
export function clockLabel(hhmm: string, locale: Locale): string {
  const [h = "0", m = "0"] = hhmm.split(":")
  const d = new Date(2000, 0, 1, Number(h), Number(m))
  return time(d, locale)
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`
}
