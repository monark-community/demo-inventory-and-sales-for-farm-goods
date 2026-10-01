import { notFound } from "next/navigation"

import { ReceiptsView } from "@/components/demo/receipts-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/receipts">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app.receipts
  return pageMetadata(locale, "/app/receipts", d.title, d.metaDescription)
}

export default async function ReceiptsPage({ params }: PageProps<"/[locale]/app/receipts">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <ReceiptsView />
}
