import type { Dictionary } from "@/i18n"

type D = Dictionary["how"]["contract"]["diagram"]

/**
 * A purchase through the stand contract: basket in, stock and takings out,
 * receipt back; the revert path and the owner-only door underneath. Flat SVG
 * line work in theme colours. On phones it stacks vertically.
 */
function Box({ x, y, w, title, sub, tone }: { x: number; y: number; w: number; title: string; sub: string; tone: "beet" | "paper" | "marigold" | "leaf" }) {
  const fill = { beet: "var(--primary)", paper: "var(--paper)", marigold: "var(--accent)", leaf: "var(--crate-leaf)" }[tone]
  const ink = tone === "beet" ? "var(--primary-foreground)" : "var(--foreground)"
  return (
    <g>
      <rect x={x + 3} y={y + 3} width={w} height={64} rx={8} fill="var(--foreground)" opacity={0.12} />
      <rect x={x} y={y} width={w} height={64} rx={8} fill={fill} stroke="var(--foreground)" strokeWidth={1.5} />
      <text x={x + w / 2} y={y + 28} textAnchor="middle" fontFamily="var(--font-display)" fontWeight={700} fontSize={17} fill={ink}>
        {title}
      </text>
      <text x={x + w / 2} y={y + 48} textAnchor="middle" fontSize={12.5} fill={ink} opacity={0.85}>
        {sub}
      </text>
    </g>
  )
}

export function ContractDiagram({ d }: { d: D }) {
  const arrow = "url(#bz-arrow)"
  return (
    <figure>
      <svg viewBox="0 0 760 300" role="img" aria-label={d.label} className="hidden w-full md:block">
        <defs>
          <marker id="bz-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" fill="var(--foreground)" />
          </marker>
        </defs>
        <Box x={10} y={100} w={170} title={d.basket} sub={d.basketSub} tone="paper" />
        <Box x={290} y={100} w={180} title={d.contract} sub={d.contractSub} tone="beet" />
        <Box x={580} y={10} w={170} title={d.stock} sub={d.stockSub} tone="paper" />
        <Box x={580} y={100} w={170} title={d.takings} sub={d.takingsSub} tone="marigold" />
        <Box x={580} y={190} w={170} title={d.receipt} sub={d.receiptSub} tone="leaf" />
        <path d="M180 132 H286" stroke="var(--foreground)" strokeWidth={2} fill="none" markerEnd={arrow} />
        <path d="M470 120 C 525 120, 525 42, 576 42" stroke="var(--foreground)" strokeWidth={2} fill="none" markerEnd={arrow} />
        <path d="M470 132 H576" stroke="var(--foreground)" strokeWidth={2} fill="none" markerEnd={arrow} />
        <path d="M470 144 C 525 144, 525 222, 576 222" stroke="var(--foreground)" strokeWidth={2} fill="none" markerEnd={arrow} />
        <path d="M380 164 V 250 H 95 V 168" stroke="var(--destructive)" strokeWidth={2} strokeDasharray="6 6" fill="none" markerEnd={arrow} />
        <text x={238} y={278} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--destructive)">
          {d.revert}
        </text>
        <text x={380} y={74} textAnchor="middle" fontSize={12.5} fill="var(--muted-foreground)">
          {d.owner}
        </text>
        <path d="M380 80 V 96" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="3 4" />
      </svg>

      {/* Phones: the same story, stacked. */}
      <ol className="space-y-2 md:hidden" aria-label={d.label}>
        {[
          [d.basket, d.basketSub, "bg-paper"],
          [d.contract, d.contractSub, "bg-primary text-primary-foreground"],
          [`${d.stock} · ${d.takings} · ${d.receipt}`, `${d.stockSub} · ${d.takingsSub}`, "bg-crate-leaf"],
        ].map(([title, sub, cls], i) => (
          <li key={i} className={`rounded-md border border-foreground/60 p-3 text-center ${cls}`}>
            <p className="font-display text-lg font-bold">{title}</p>
            <p className="text-sm opacity-85">{sub}</p>
          </li>
        ))}
        <li className="rounded-md border border-dashed border-destructive p-3 text-center text-sm font-semibold text-destructive">{d.revert}</li>
        <li className="text-center text-xs text-muted-foreground">{d.owner}</li>
      </ol>
    </figure>
  )
}
