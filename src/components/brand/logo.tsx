import { cn } from "@/lib/utils"

/**
 * The Bazarius mark: a price tag with a punched hole and a two-leaf sprout.
 * Colours come from the theme (primary / primary-foreground).
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <g transform="rotate(-10 16 16)">
        <path d="M12.2 5.5h13.3a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H12.2a2 2 0 0 1-1.5-.7L3.9 17.3a2 2 0 0 1 0-2.6l6.8-8.5a2 2 0 0 1 1.5-.7Z" className="fill-primary" />
        <circle cx="10" cy="16" r="2.1" className="fill-background" />
        <path d="M19.4 23v-6.6" className="stroke-primary-foreground" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M19.4 17.2c-3.6.2-5.3-1.7-5.4-4.9 3.4-.1 5.3 1.6 5.4 4.9Z" className="fill-primary-foreground" />
        <path d="M19.4 15.6c.1-3.5 2.1-5.4 5.6-5.3-.1 3.6-2 5.3-5.6 5.3Z" className="fill-primary-foreground" />
      </g>
    </svg>
  )
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-[1.45rem] leading-none font-bold tracking-tight">Bazarius</span>
    </span>
  )
}
