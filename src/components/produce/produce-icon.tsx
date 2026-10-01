import {
  Amphora,
  Apple,
  Bean,
  Carrot,
  Droplet,
  Droplets,
  Egg,
  Flower2,
  Leaf,
  LeafyGreen,
  Sprout,
  Wheat,
  type LucideProps,
} from "lucide-react"
import type { ComponentType, SVGProps } from "react"

import type { CrateTone, ProduceIcon as IconKey } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

/* Lucide has no tomato, garlic, pumpkin or jar: drawn here in the same 24px, 2px-stroke style. */
type IconProps = SVGProps<SVGSVGElement>
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const

function Tomato(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 7c-4.5 0-8 2.6-8 6.5S7.5 21 12 21s8-3.6 8-7.5S16.5 7 12 7Z" />
      <path d="m12 7-2.5-2M12 7l2.5-2M12 7v-4M12 7l-4 1M12 7l4 1" />
    </svg>
  )
}

function Garlic(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c0 3-1 4-3 5.5C6 10.5 4.5 13 5 16c.6 3.2 3.5 5 7 5s6.4-1.8 7-5c.5-3-1-5.5-4-7.5C13 7 12 6 12 3Z" />
      <path d="M12 9c-1.5 2.5-2 7-1 12M12 9c1.5 2.5 2 7 1 12" />
    </svg>
  )
}

function Pumpkin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 8c-1.2-1-4-1.3-5.8.2C3.6 10.3 3.5 15 5.2 17.8 6.7 20.4 9.5 21 12 20" />
      <path d="M12 8c1.2-1 4-1.3 5.8.2 2.6 2.1 2.7 6.8 1 9.6-1.5 2.6-4.3 3.2-6.8 2.2" />
      <path d="M12 8c-1.7 2.5-1.7 9.5 0 12 1.7-2.5 1.7-9.5 0-12ZM12 8c0-2 .5-3.5 2-4.5" />
    </svg>
  )
}

function Jar(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 3h8v3H8z" />
      <path d="M7 6h10l1 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z" />
      <path d="M6 12h12M6 16h12" />
    </svg>
  )
}

type AnyIcon = ComponentType<LucideProps> | ComponentType<IconProps>

const icons: Record<IconKey, AnyIcon> = {
  tomato: Tomato,
  corn: Wheat,
  egg: Egg,
  greens: LeafyGreen,
  garlic: Garlic,
  syrup: Droplet,
  zucchini: Bean,
  apple: Apple,
  cider: Amphora,
  pumpkin: Pumpkin,
  jar: Jar,
  carrot: Carrot,
  kale: Leaf,
  herbs: Sprout,
  honey: Droplets,
  flowers: Flower2,
}

const tones: Record<CrateTone, string> = {
  beet: "bg-crate-beet",
  leaf: "bg-crate-leaf",
  marigold: "bg-crate-marigold",
  soil: "bg-crate-soil",
  slate: "bg-crate-slate",
}

/** A produce icon on its crate-label tint. Decorative: the product name is always next to it. */
export function ProduceBadge({ icon, tone, className, iconClassName }: { icon: IconKey; tone: CrateTone; className?: string; iconClassName?: string }) {
  const Icon = icons[icon]
  return (
    <span aria-hidden="true" className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-md text-foreground", tones[tone], className)}>
      <Icon className={cn("size-6", iconClassName)} strokeWidth={1.75} />
    </span>
  )
}
