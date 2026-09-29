import type { MetadataRoute } from "next"

import { locales, SITE_URL } from "@/i18n/config"
import { standIds } from "@/lib/demo/catalog"

// /pricing is deliberately absent: it is an unlinked internal-review page.
const PATHS = ["", "/how-it-works", "/app", ...standIds().map((id) => `/app/stand/${id}`), "/app/receipts", "/app/farm", "/app/farm/count", "/credits"]

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
    }))
  )
}
