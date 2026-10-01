import { notFound } from "next/navigation"

import { FarmView } from "@/components/demo/farm-view"
import { isLocale, SITE_URL } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/farm">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app.farm
  return pageMetadata(locale, "/app/farm", d.title, d.shelfBody)
}

export default async function FarmPage({ params }: PageProps<"/[locale]/app/farm">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <FarmView origin={SITE_URL} />
}
