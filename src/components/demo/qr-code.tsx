import { encode } from "uqr"

import { cn } from "@/lib/utils"

/**
 * A real, scannable QR code as one SVG path. Always dark on white (both
 * themes) so any phone camera can read it.
 */
export function QrCode({ value, label, className }: { value: string; label?: string; className?: string }) {
  const { data, size } = encode(value, { border: 0, ecc: "M" })
  let d = ""
  data.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) d += `M${x} ${y}h1v1h-1z`
    })
  )
  return (
    <svg
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      className={cn("rounded-sm bg-white", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      shapeRendering="crispEdges"
    >
      <path d={d} fill="#211b14" />
    </svg>
  )
}
