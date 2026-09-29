import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { href, MONARK_URL, PROJECT_DOC_URL, REPO_URL, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const f = c.footer
  const links = [
    { href: href(locale, "/how-it-works"), label: c.nav.how },
    { href: href(locale, "/app"), label: c.nav.demo },
    { href: href(locale, "/app/receipts"), label: c.nav.receipts },
    { href: href(locale, "/credits"), label: c.nav.credits },
  ]
  return (
    <footer className="mt-auto border-t bg-card print:hidden">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{f.tagline}</p>
        </div>
        <nav aria-label={f.links}>
          <h2 className="eyebrow font-sans text-muted-foreground">{f.links}</h2>
          <ul className="mt-3 space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-9 items-center text-sm font-medium underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="eyebrow font-sans text-muted-foreground">{f.product}</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <a href={PROJECT_DOC_URL} className="inline-flex min-h-9 items-center text-sm font-medium underline-offset-4 hover:underline">
                {f.project}
              </a>
            </li>
            <li>
              <a href={REPO_URL} className="inline-flex min-h-9 items-center text-sm font-medium underline-offset-4 hover:underline">
                {f.repo}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col gap-3 py-5 text-[0.8125rem] text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-sm border border-input px-1.5 py-0.5 text-xs font-semibold text-foreground">{c.demoBadge}</span>
            <span>{f.rights}</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href={href(locale, "/credits")} className="underline-offset-4 hover:underline">
              {f.photos}
            </Link>
            <a href={MONARK_URL} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
              <span
                aria-hidden="true"
                className="inline-block size-3.5 bg-muted-foreground [mask:url(/brand/monark-mono.svg)_center/contain_no-repeat]"
              />
              {f.builtWith}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
