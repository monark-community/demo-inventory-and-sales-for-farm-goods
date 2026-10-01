"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { NavLinks, type NavItem } from "./nav-links"

interface Props {
  items: NavItem[]
  openLabel: string
  closeLabel: string
  title: string
  description: string
  action: { href: string; label: string }
  switches: ReactNode
}

/** Full-height sheet with the links, the switches and the primary action. Closes on navigation. */
export function MobileMenu({ items, openLabel, closeLabel, title, description, action, switches }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={openLabel} className="md:hidden">
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={closeLabel} className="w-full max-w-none gap-0 p-0 data-[side=right]:w-full sm:max-w-sm">
        <div className="flex h-16 items-center border-b px-4">
          <SheetTitle className="font-display text-xl">{title}</SheetTitle>
          <SheetDescription className="sr-only">{description}</SheetDescription>
        </div>
        <nav aria-label={title} className="flex-1 overflow-y-auto p-4">
          <NavLinks items={items} vertical />
        </nav>
        <div className="space-y-4 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">{switches}</div>
          <Button asChild size="lg" className="w-full">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
