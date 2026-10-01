import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { LocaleSwitch } from "./locale-switch"
import { MobileMenu } from "./mobile-menu"
import { NavLinks } from "./nav-links"
import { ThemeToggle } from "./theme"

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const items = [
    { href: href(locale, "/how-it-works"), label: c.nav.how },
    { href: href(locale, "/app"), label: c.nav.demo, prefix: true },
  ]
  const switches = (
    <>
      <LocaleSwitch locale={locale} label={c.language} names={c.localeNames} short={c.localeShort} />
      <ThemeToggle label={c.theme} />
    </>
  )
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 print:hidden">
      <div className="container-page flex h-16 items-center gap-3">
        <Link href={href(locale)} aria-label={c.home} className="-ml-1 rounded-md p-1">
          <Logo />
        </Link>
        <nav aria-label={c.navLabel} className="ml-4 hidden md:block">
          <NavLinks items={items} />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex">{switches}</div>
          <Button asChild className="hidden md:inline-flex">
            <Link href={href(locale, "/app")}>{c.openDemo}</Link>
          </Button>
          <MobileMenu
            items={items}
            openLabel={c.menu}
            closeLabel={c.closeMenu}
            title="Bazarius"
            description={c.navLabel}
            action={{ href: href(locale, "/app"), label: c.openDemo }}
            switches={switches}
          />
        </div>
      </div>
    </header>
  )
}
