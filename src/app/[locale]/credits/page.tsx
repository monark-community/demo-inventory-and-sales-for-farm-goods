import Image from "next/image"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { photos } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).credits
  return pageMetadata(locale, "/credits", d.metaTitle, d.metaDescription)
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const c = getDictionary(locale).credits

  return (
    <div className="container-page max-w-4xl py-12 md:py-16">
      <h1 className="text-4xl sm:text-5xl">{c.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{c.intro}</p>

      <h2 className="mt-12 text-2xl">{c.photosTitle}</h2>
      <ul className="mt-5 grid gap-5 sm:grid-cols-2">
        {Object.values(photos).map((p) => (
          <li key={p.page} className="flex gap-4 rounded-lg border bg-card p-3">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-md">
              <Image src={p.src} alt="" fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                <a href={p.page} className="underline underline-offset-4 hover:decoration-2">
                  {t(c.by, { name: p.photographer })}
                </a>{" "}
                <a href={p.profile} className="text-muted-foreground underline-offset-4 hover:underline">
                  ({p.profile.replace("https://unsplash.com/", "")})
                </a>{" "}
                <span className="text-muted-foreground">{c.on}</span>
              </p>
              <p className="mt-1 text-muted-foreground">{t(c.usedOn, { where: p.usedOn[locale] })}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-2xl">{c.builtTitle}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
        {c.built.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  )
}
