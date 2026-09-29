import { notFound } from "next/navigation"

import { StandView } from "@/components/demo/stand-view"
import { isLocale, locales } from "@/i18n/config"
import { getStand, standIds } from "@/lib/demo/catalog"
import { pageMetadata } from "@/lib/metadata"

export function generateStaticParams() {
  return locales.flatMap((locale) => standIds().map((standId) => ({ locale, standId })))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/[locale]/app/stand/[standId]">) {
  const { locale, standId } = await params
  const stand = getStand(standId)
  if (!isLocale(locale) || !stand) return {}
  return pageMetadata(locale, `/app/stand/${standId}`, stand.name, stand.blurb[locale])
}

export default async function StandPage({ params }: PageProps<"/[locale]/app/stand/[standId]">) {
  const { locale, standId } = await params
  if (!isLocale(locale) || !getStand(standId)) notFound()
  return <StandView standId={standId} />
}
