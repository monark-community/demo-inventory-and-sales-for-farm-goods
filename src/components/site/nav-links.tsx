"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
  /** Active for this path and anything under it. */
  prefix?: boolean
}

/** Header text links with a pill on the active one. */
export function NavLinks({ items, className, vertical = false }: { items: NavItem[]; className?: string; vertical?: boolean }) {
  const pathname = usePathname() ?? ""
  return (
    <ul className={cn("flex gap-1", vertical ? "flex-col" : "items-center", className)}>
      {items.map((item) => {
        const active = item.prefix ? pathname === item.href || pathname.startsWith(`${item.href}/`) : pathname === item.href
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center rounded-full font-semibold transition-colors duration-150",
                vertical ? "min-h-12 w-full px-4 text-lg" : "h-9 px-3.5 text-sm",
                active ? "bg-foreground text-background" : "text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
