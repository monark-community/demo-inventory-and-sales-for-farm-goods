"use client"

import { Sprout, Store } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NetworkBadge } from "@/components/ui/network-badge"
import { href } from "@/i18n/config"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"
import { WalletButton } from "./wallet-button"

/** The demo's own strip under the site header: whose side you're on, sub-pages, wallet, controls. */
export function AppBar() {
  const { app, locale, demoBadge } = useAppCopy()
  const pathname = usePathname() ?? ""
  const farmBase = href(locale, "/app/farm")
  const isFarm = pathname === farmBase || pathname.startsWith(`${farmBase}/`)
  const role = isFarm ? "farmer" : "shopper"

  const sub = isFarm
    ? [
        { href: farmBase, label: app.subnav.today },
        { href: href(locale, "/app/farm/count"), label: app.subnav.count },
      ]
    : [
        { href: href(locale, "/app"), label: app.subnav.stands, alsoActive: href(locale, "/app/stand") },
        { href: href(locale, "/app/receipts"), label: app.subnav.receipts },
      ]

  const roleLink = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-semibold transition-colors",
      active ? "bg-card text-foreground shadow-crate-sm" : "text-muted-foreground hover:text-foreground"
    )

  return (
    <div className="border-b bg-secondary/60 print:hidden">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
        <nav aria-label={app.roles.label} className="flex rounded-md border border-input bg-muted p-0.5">
          <Link href={href(locale, "/app")} aria-current={!isFarm ? "page" : undefined} className={roleLink(!isFarm)}>
            <Store className="size-4" aria-hidden="true" />
            {app.roles.shopper}
          </Link>
          <Link href={farmBase} aria-current={isFarm ? "page" : undefined} className={roleLink(isFarm)}>
            <Sprout className="size-4" aria-hidden="true" />
            {app.roles.farmer}
          </Link>
        </nav>
        <span className="hidden rounded-sm border border-input px-2 py-1 text-xs font-semibold md:inline">{demoBadge}</span>
        <div className="ml-auto flex items-center gap-2">
          <DemoControls />
          <WalletButton preferred={role} />
        </div>
      </div>
      <div className="container-page flex items-center gap-4 pb-2">
        <nav aria-label={isFarm ? app.roles.farmer : app.roles.shopper} className="-mx-1 flex gap-1 overflow-x-auto">
          {sub.map((item) => {
            const active = pathname === item.href || ("alsoActive" in item && item.alsoActive ? pathname.startsWith(item.alsoActive) : false)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center border-b-2 px-2 text-sm font-semibold",
                  active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <span className="rounded-sm border border-input px-2 py-0.5 text-[0.6875rem] font-semibold md:hidden">{demoBadge}</span>
          <NetworkBadge name={app.network} variant="outline" className="hidden sm:inline-flex" icon={<span className="block size-full rounded-full bg-chart-5" />} />
        </span>
      </div>
    </div>
  )
}
