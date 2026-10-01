import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { money } from "@/lib/format"

export const alt = "Bazarius"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const mark = await readFile(join(process.cwd(), "public/brand/bazarius-mark.svg"), "utf8")
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`
  const h = d.home.hero

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F3EEE3", color: "#211B14", padding: 72, gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={72} height={72} alt="" />
            <span style={{ fontSize: 52, fontWeight: 800 }}>Bazarius</span>
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: "#5F5446" }}>{d.common.demoBadge}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#FFFDF8",
              border: "2px solid #211B14",
              borderRadius: 12,
              padding: 32,
              boxShadow: "8px 8px 0 0 rgba(33,27,20,0.16)",
              transform: "rotate(2deg)",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: "#8A2A4F", textTransform: "uppercase" }}>{h.ticketTitle}</span>
            <span style={{ fontSize: 34, fontWeight: 800, marginTop: 14, lineHeight: 1.15 }}>{h.ticketLine}</span>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, paddingTop: 16, borderTop: "2px dashed #978770", fontSize: 22 }}>
              <span style={{ color: "#5F5446" }}>{h.ticketStock}</span>
              <span style={{ fontWeight: 800 }}>+{money(450, locale)}</span>
            </div>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-end",
                marginTop: 22,
                border: "4px solid #8A2A4F",
                color: "#8A2A4F",
                padding: "4px 14px",
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 4,
                transform: "rotate(-8deg)",
              }}
            >
              {d.app.receipt.paid}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
