import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { FeatureVisual } from "@/components/home/feature-visuals"
import { HeroVisual } from "@/components/home/hero-visual"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { photos } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/", null, d.description)
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home

  return (
    <>
      {/* Hero */}
      <section className="container-page grid items-center gap-12 pt-10 pb-20 md:pt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-24">
        <div>
          <h1 className="text-[2.5rem] sm:text-5xl lg:text-[4rem]">{h.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{h.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={href(locale, "/app/stand/trois-erables")}>
                {h.ctaPrimary}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={href(locale, "/app/farm")}>{h.ctaSecondary}</Link>
            </Button>
          </div>
        </div>
        <HeroVisual locale={locale} dict={dict} />
      </section>

      {/* The honesty box problem */}
      <section className="border-y bg-card">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-24">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg border shadow-crate md:max-w-none">
            <Image src={photos.honestyBox.src} alt={h.problem.imageAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">{h.problem.title}</h2>
            <ol className="mt-8 space-y-5">
              {h.problem.points.map((pt, i) => (
                <li key={pt.title} className="flex gap-4">
                  <span className="font-display text-2xl leading-none font-bold text-primary tnum" aria-hidden="true">
                    {i + 1}
                  </span>
                  <p>
                    <strong className="font-semibold">{pt.title}</strong> <span className="text-muted-foreground">{pt.body}</span>
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-8 border-l-4 border-accent pl-4 text-lg font-medium">{h.problem.answer}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-card">
        <div className="container-page py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">{h.features.title}</h2>
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {h.features.items.map((item) => (
              <li key={item.title}>
                <FeatureVisual kind={item.visual} locale={locale} v={h.features.visual} />
                <h3 className="mt-4 text-xl">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* For growers */}
      <section className="container-page grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="md:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg border shadow-crate md:max-w-md">
            <Image src={photos.inTheField.src} alt={h.grower.imageAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-top" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">{h.grower.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{h.grower.body}</p>
          <Button asChild size="lg" variant="outline" className="mt-8">
            <Link href={href(locale, "/app/farm")}>{h.grower.cta}</Link>
          </Button>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <h2 className="max-w-2xl text-3xl sm:text-4xl">{h.closing.title}</h2>
          <Button asChild size="lg" variant="accent" className="shrink-0">
            <Link href={href(locale, "/app")}>
              {h.closing.cta}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
