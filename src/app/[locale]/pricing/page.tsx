import { Check } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { intlLocale, isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Internal strategy review only: never linked from anywhere, not in the
 * sitemap, and marked noindex/nofollow.
 */
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {
    title: getDictionary(locale).pricing.metaTitle,
    robots: { index: false, follow: false },
  }
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const p = getDictionary(locale).pricing
  const usd = new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "USD", maximumFractionDigits: 0 })

  return (
    <div className="container-page py-12 md:py-16">
      <p className="eyebrow inline-block rounded-sm border border-dashed border-input px-2 py-1 text-muted-foreground">{p.eyebrow}</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">{p.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{p.intro}</p>

      <ul className="mt-10 grid gap-5 lg:grid-cols-3">
        {p.plans.map((plan) => {
          const featured = "featured" in plan && plan.featured
          return (
            <li key={plan.name} className={cn("flex flex-col rounded-lg border bg-card p-6", featured && "border-2 border-primary shadow-crate")}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-2xl">{plan.name}</h2>
                {featured && <span className="rounded-sm bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">{p.featured}</span>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.for}</p>
              <p className="mt-5 font-display text-4xl font-bold tnum">
                {plan.price === "0" ? (
                  p.free
                ) : (
                  <>
                    {usd.format(Number(plan.price))} <span className="font-sans text-base font-semibold text-muted-foreground">{p.perMonth}</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-sm font-semibold">{t(p.plusFee, { fee: plan.fee })}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">{p.rationaleTitle}</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-muted-foreground">
          {p.rationale.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground italic">{p.assumptions}</p>
      </section>
    </div>
  )
}
