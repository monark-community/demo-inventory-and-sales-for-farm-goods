import { notFound } from "next/navigation"

import { CountView } from "@/components/demo/count-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/farm/count">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app.count
  return pageMetadata(locale, "/app/farm/count", d.title, d.body)
}

export default async function CountPage({ params }: PageProps<"/[locale]/app/farm/count">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <CountView />
}
