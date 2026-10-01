import Link from "next/link"
import { locale as rootLocale } from "next/root-params"

import { LogoMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

async function currentLocale(): Promise<Locale> {
  const value = await rootLocale()
  return value && isLocale(value) ? value : "en"
}

export default async function NotFound() {
  const locale = await currentLocale()
  const c = getDictionary(locale).common
  return (
    <section className="container-page flex flex-1 flex-col items-center justify-center py-20 text-center">
      <LogoMark className="size-24" />
      <p className="eyebrow mt-10 text-primary">{c.notFound.eyebrow}</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">{c.notFound.title}</h1>
      <p className="mt-4 max-w-md text-muted-foreground">{c.notFound.body}</p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button asChild size="lg">
          <Link href={href(locale)}>{c.notFound.home}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={href(locale, "/app")}>{c.notFound.demo}</Link>
        </Button>
      </div>
    </section>
  )
}
