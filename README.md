# Bazarius

**Self-serve farm stands that take payment, count their own stock and tell the grower what's low.**

Passers-by scan the QR sign at an unstaffed roadside stand, pay for their basket from their phone, and take it. The stand contract moves the money and decrements stock in one step, so the grower sees every sale land, gets an alert when the eggs run low, marks greens down in the evening, and closes the day with a shelf count that shows exactly what left without being paid for.

This repository is the **demo site**: a Next.js app with a fully simulated testnet, wallet and stand contract. Nothing is real; no funds move. Bazarius is an independent product incubated by [Monark](https://www.monark.io). Project description: https://www.monark.io/en/project/inventory-and-sales-for-farm-goods

- English and French (`/en`, `/fr`), light and dark themes.
- Planning and design decisions: [`docs/site-plan.md`](docs/site-plan.md). Photo credits: [`docs/assets.md`](docs/assets.md). Screenshots: [`docs/screenshots/`](docs/screenshots/).

## Run it locally

Requires Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Checks and production build:

```bash
pnpm lint
pnpm typecheck
pnpm build && pnpm start
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL (default `https://bazarius.monark.io`), which is also what the stand QR codes point to.

### Screenshots

```bash
pnpm build && pnpm start -p 3146     # in one terminal
pnpm screenshots                     # in another (BASE_URL defaults to http://localhost:3146)
```

This walks every page and the four key flows at 390 px and 1440 px, light and dark, plus French, and writes PNGs to `docs/screenshots/` (Playwright; run `pnpm exec playwright install chromium` once).

## The demo

Open `/en/app`. You can play both sides of one stand:

1. **Buy at the stand (shopper).** Scan a stand sign, fill a basket, connect the demo wallet and pay. Watch the receipt get stamped PAID, the shelf tally drop and the sale print in the "Meanwhile at the farm" rail.
2. **Receipts and rewards.** See your receipts and stamp cards, verify a receipt against the stand ledger, redeem a full stamp card.
3. **Restock and reprice (grower).** Switch to Élise's farm wallet. Act on low-stock alerts, edit prices, stock, alert thresholds and evening markdowns as a draft, then publish them in one transaction. Print the stand sign (its QR code really opens the stand).
4. **Close the day.** Count the shelf, see what's unaccounted for and what it's worth, record the count and withdraw the takings.

The sliders button in the demo bar opens **demo controls**: fail the next transaction, make another shopper buy first (the purchase reverts and the basket fixes itself), slow network, jump the stand clock to 17:30 (evening markdowns), simulate a passer-by purchase, and reset the demo.

### How the simulation works

Everything lives behind a small typed layer in `src/lib/demo/`, so it could be swapped for wagmi/viem and a real contract without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Domain types: stands, products, sales, ledger entries, counts, wallet, transaction states. Amounts are integer cents of tUSDC. |
| `catalog.ts` | Static demo world: three stands in Québec, their shelves, addresses, reward rules. |
| `seed.ts` | Builds the starting day relative to "now" (the day's sales, an alert, yesterday's count and withdrawal). |
| `store.ts` | External store (`useSyncExternalStore`) persisted to `localStorage` under `bazarius-demo-v1`, every access in try/catch; also the promise-based wallet prompt. |
| `chain.ts` | `useTx()`: wallet prompt → pending with a hash for 1.2–2.4 s (3–6 s on slow network) → the contract call runs → confirmed with a block number, or failed with a reason (`rejected`, `reverted`, `stock`, `funds`, `owner`). |
| `ops.ts` | The simulated stand contract: `purchase` (oversell guard, stamp card, reward), `publishShelf`, `recordCount`, `withdraw` (owner only), `faucet`, plus read helpers. |
| `pricing.ts` | Stand clock and evening markdown pricing. |
| `wallet.ts` | Simulated wallet with two accounts (shopper and farm owner); connecting signs a message in the prompt. |

The site shows "Demo · simulated data" everywhere and the "Testnet demo · not financial advice · no real funds" notice wherever value moves.

## Project structure

```
src/
  app/
    [locale]/            locale layout, home, how-it-works, credits, pricing (unlinked), 404, error, OG image
    [locale]/app/        demo: scan, stand/[standId], receipts, farm, farm/count
    globals.css          Bazarius theme (overrides the @monark/ui registry variables), motion
    sitemap.ts, robots.ts, icon.svg
  components/
    brand/               logo mark and wordmark
    site/                header, mobile menu, footer, locale switch, theme toggle
    home/                hero visual, two-screens preview, feature visuals
    demo/                app bar, wallet prompt, checkout, receipts, farm dashboard, shelf editor, count, QR sign…
    diagrams/            stand contract diagram
    produce/             produce icons on crate-label tints
    ui/                  shadcn + @monark/ui registry components (re-themed)
  i18n/                  locale config and EN/FR dictionaries
  lib/                   demo layer, formatting, metadata, photos
  proxy.ts               / → /en or /fr from Accept-Language
scripts/screenshots.mjs  Playwright visual check
docs/                    site plan, assets, screenshots
```

UI components come from the [Monark UI registry](https://ui.monark.io) (`components.json` registers `@monark`), re-themed with Bazarius's own palette and type.

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults: no `vercel.json`, no environment variables. Every page is prerendered at build time.
