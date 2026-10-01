"use client"

import { Sprout, Store } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { href } from "@/i18n/config"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"
import { WalletButton } from "./wallet-button"

/**
 * The demo's one compact bar under the site header: whose side you're on and
 * its pages on the left; the network pill (opens the demo controls) and the
 * wallet on the right. On phones the role switch is icon-only.
 */
export function AppBar() {
  const { app, locale } = useAppCopy()
  const pathname = usePathname() ?? ""
  const farmBase = href(locale, "/app/farm")
  const isFarm = pathname === farmBase || pathname.startsWith(`${farmBase}/`)
  const role = isFarm ? "farmer" : "shopper"

  const sub = isFarm
    ? [
        { href: farmBase, label: app.subnav.today },
        { href: href(locale, "/app/farm/count"), label: app.subnav.count, short: app.subnav.countShort },
      ]
    : [
        { href: href(locale, "/app"), label: app.subnav.stands, alsoActive: href(locale, "/app/stand") },
        { href: href(locale, "/app/receipts"), label: app.subnav.receipts },
      ]

  const roleLink = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-sm font-semibold transition-colors sm:px-3",
      active ? "bg-card text-foreground shadow-crate-sm" : "text-muted-foreground hover:text-foreground"
    )

  return (
    <div className="border-b bg-secondary/60 print:hidden">
      <div className="container-page flex items-center gap-1.5 py-2 sm:gap-3">
        <nav aria-label={app.roles.label} className="flex shrink-0 rounded-md border border-input bg-muted p-0.5">
          <Link href={href(locale, "/app")} aria-current={!isFarm ? "page" : undefined} aria-label={app.roles.shopper} className={roleLink(!isFarm)}>
            <Store className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{app.roles.shopper}</span>
          </Link>
          <Link href={farmBase} aria-current={isFarm ? "page" : undefined} aria-label={app.roles.farmer} className={roleLink(isFarm)}>
            <Sprout className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{app.roles.farmer}</span>
          </Link>
        </nav>
        <nav aria-label={isFarm ? app.roles.farmer : app.roles.shopper} className="flex min-w-0 gap-0.5 overflow-x-auto sm:gap-1">
          {sub.map((item) => {
            const active = pathname === item.href || ("alsoActive" in item && item.alsoActive ? pathname.startsWith(item.alsoActive) : false)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center border-b-2 px-1.5 text-sm font-semibold sm:px-2",
                  active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {"short" in item && item.short ? (
                  <>
                    <span className="sm:hidden">{item.short}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <DemoControls />
          <WalletButton preferred={role} />
        </div>
      </div>
    </div>
  )
}
