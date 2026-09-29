import Image from "next/image"

import { LogoMark } from "@/components/brand/logo"
import { ProduceBadge } from "@/components/produce/produce-icon"
import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { money } from "@/lib/format"
import { photos } from "@/lib/photos"

/**
 * Hero: a real unstaffed stand, with the live product laid over it. A pure-CSS
 * loop taps "Pay", rolls the tomato tally from 14 to 13 and prints the sale on
 * the grower's ticket (static under prefers-reduced-motion).
 */
export function HeroVisual({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.home.hero
  return (
    <figure className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border shadow-crate">
        <Image
          src={photos.unstaffedStand.src}
          alt={dict.home.heroAlt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover object-[65%_center]"
        />
      </div>

      {/* The shopper's phone */}
      <div
        aria-hidden="true"
        className="absolute -bottom-10 left-3 w-[min(15rem,62%)] rounded-[1.4rem] border-[5px] border-foreground bg-card p-3 shadow-crate sm:left-5"
      >
        <div className="flex items-center gap-2">
          <LogoMark className="size-5" />
          <span className="truncate font-display text-sm font-bold">{h.stand}</span>
        </div>
        <p className="eyebrow mt-3 text-[0.625rem] text-muted-foreground">{h.shelf}</p>
        <div className="mt-1.5 flex items-center gap-2.5 rounded-md border bg-paper p-2">
          <ProduceBadge icon="tomato" tone="beet" className="size-9" iconClassName="size-5" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[0.8125rem] font-semibold">{h.product}</p>
            <p className="relative h-4 overflow-hidden text-[0.6875rem] text-muted-foreground">
              <span className="bz-hero-old absolute inset-0">14 {h.left}</span>
              <span className="bz-hero-new absolute inset-0 font-semibold text-foreground">13 {h.left}</span>
            </p>
          </div>
          <span className="font-display text-base font-bold tnum">{money(450, locale)}</span>
        </div>
        <div className="bz-hero-tap mt-2.5 flex h-9 items-center justify-center rounded-md bg-primary text-[0.8125rem] font-semibold text-primary-foreground">
          {h.pay} {money(450, locale)} tUSDC
        </div>
      </div>

      {/* The grower's ticket */}
      <div
        aria-hidden="true"
        className="bz-hero-ticket receipt-edge absolute -right-1 top-5 w-[min(14rem,58%)] bg-paper px-3.5 pt-3 text-foreground shadow-crate sm:-right-4"
      >
        <p className="eyebrow text-[0.625rem] text-primary">{h.ticketTitle}</p>
        <p className="mt-1.5 font-display text-[0.95rem] leading-snug font-bold">{h.ticketLine}</p>
        <div className="mt-1.5 flex items-baseline justify-between border-t border-dashed border-input pt-1.5 text-xs">
          <span className="text-muted-foreground">{h.ticketStock}</span>
          <span className="font-semibold tnum">+{money(450, locale)}</span>
        </div>
      </div>
      <figcaption className="mt-14 text-right text-xs text-muted-foreground sm:mt-4">{h.caption}</figcaption>
    </figure>
  )
}
