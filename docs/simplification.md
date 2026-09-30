# Simplification pass

Owner feedback on the rebuilt demo sites: *"Simplify, reduce text quantity, revise flows so that context is only given when necessary. Two top bars on homepage is too busy; demo banners only on demo/app pages."* This pass applies the method and checklist from the TrustRate pilot (`address-review-system/docs/simplification.md` §4) to Bazarius.

Bazarius is an independent brand, so it keeps its own header and footer. It gets the "Restraint" rules (brand guidelines §8), the one-top-bar rule and the disclaimer placement of §11.

How the numbers are measured (both scripts are in `scripts/`, run against `pnpm start -p 3146`):

- `node scripts/wordcount.mjs`: words per page, English, at 1440px. *Visible* is the `innerText` of `<main>`; *total* also counts closed disclosures and FAQ answers; *chrome* is everything outside `<main>` (header and footer). On `/app` pages the app bar is inside `<main>`. The stand, dashboard and count pages include seeded data (product names, ledger lines, prices), and the shelf editor's screen-reader labels and select options are counted too.
- `node scripts/dictcount.mjs`: words of UI copy in `src/i18n/dictionaries/{en,fr}.ts`, per section.

## 1. Before

| Page | Visible in main | Total in main | Chrome |
|-|-:|-:|-:|
| Home | 544 | 548 | 65 |
| How it works | 346 | 344 | 65 |
| Credits | 118 | 118 | 65 |
| 404 | 32 | 32 | 65 |
| App: scan | 145 | 148 | 65 |
| App: grower gate (disconnected) | 48 | 51 | 65 |
| App: stand shelf | 280 | 378 | 65 |
| App: receipts | 133 | 136 | 65 |
| App: farm dashboard | 389 | 402 | 65 |
| App: close the day | 113 | 130 | 65 |
| **Total** | **2,148** | **2,287** | **650** |

Dictionary copy: **EN 2,716 words** (meta 47 · common 115 · home 514 · how 554 · credits 82 · pricing 220 · app 1,184); **FR 3,058 words**.

What was there:

- **Marketing pages** already had one top bar (the header), but the hero repeated "Testnet demo · not financial advice · no real funds" under its buttons.
- **Home:** hero with eyebrow and a 28-word subline, plus a caption under the photo; "The problem" with eyebrow, intro line, three two-sentence points and an answer paragraph; "One stand, two screens" with eyebrow, 24-word intro, a static shelf and ledger (restating the hero's phone and farm ticket) and a third button to the demo; six features with 10–25-word bodies; grower band with eyebrow, 30-word paragraph, three check points and a button; closing CTA with a 20-word body line.
- **How it works:** eyebrow, 26-word intro, six step lines of 12–16 words, a contract intro line, the diagram **and** a four-item list repeating what the diagram shows, a kit intro line, six FAQ questions with 25–40-word answers.
- **App bar:** two stacked rows (role tabs, "Demo · simulated data" badge, demo controls button, wallet; then sub-pages and a network badge).
- **App screens:** eyebrows ("Shopper", "Grower") above every title; intro paragraphs on the scan, receipts and count screens; a permanent "Two sides, one demo" help panel on the scan screen; a stand description paragraph; the stamp-card rule written twice (stamp card and under the pay button); the receipt followed by "Élise just saw this sale land…" (the farm rail next to it already shows that); "What Élise sees on her phone" under the rail title; the wallet prompt showed the testnet notice **and** "Nothing here is real…"; a help line above the shelf editor; a "Close the day" card whose heading and button said the same thing; a sign description; a withdraw description; "Limit n per basket" on every product card; the buyer's address under every ledger line; 6 rail lines and up to 16 dashboard ledger lines; two-sentence empty states.

## 2. What changed

No feature or flow was removed. Every flow in the site plan still runs end to end (the full Playwright screenshot run passes).

### Shell
- **One top bar on marketing pages:** unchanged (the header only). The hero's testnet line is gone.
- **Footer:** product line 17 → 11 words; legal line "Demo product incubated by Monark. Not a real service." → "Incubated by Monark." next to the "Demo · simulated data" badge (the demo notice was already there).
- **Disclaimers:** "Testnet demo · not financial advice · no real funds" now appears only in the wallet prompt of a transaction that moves funds (pay, top-up, withdraw), once per transaction. The prompt's second note ("Nothing here is real…") was removed; its subtitle is screen-reader only.

### Home (hero + 5 sections → hero + 4 sections)
- Hero: removed the eyebrow, the testnet line and the photo caption; subline 28 → 16 words.
- "The honesty box": removed eyebrow and intro line; each failure is a title plus 5–7 words; the answer is one 8-word line.
- **Removed "One stand, two screens".** The hero already shows both sides of one stand (the shopper's phone and the farm ticket, with the tally rolling from 14 to 13). The alert it showed moved into the features.
- Features: 6 → 4 cards (paid before it leaves, alerts, evening markdown, the count), bodies 10–25 → 7–10 words, eyebrow removed. "A shelf that counts itself" is the hero; the stamp card lives in the demo.
- Grower band: removed eyebrow and the three check points; paragraph 30 → 10 words.
- Closing: heading + button (body line removed).

### How it works
- Removed the eyebrow; intro 26 → 10 words.
- Step lines cut to 5–7 words.
- Contract section: heading + diagram. The four-item guarantee list repeated the diagram's labels (revert path, owner-only path, receipt) and was removed.
- Kit: intro line removed, items shortened. "Can I sell by weight?" left the FAQ and became the last kit line ("Later: a scale, to sell by weight").
- FAQ: 6 → 5 questions, answers 25–40 → 12–18 words. It is the only FAQ on the site.

### App (`/app/...`)
- **One bar instead of two rows.** Role switch (Shopper / Grower) and that side's pages on the left; on the right, one network pill ("● Base Sepolia") that opens the demo controls, and the wallet. The demo badge left the bar (it is in the footer). On phones the role switch and the pill are icon-only and "Close the day" reads "Count", so the whole bar fits at 390px in English and French (checked on the scan, stand, dashboard and count screens).
- Removed the "Shopper" / "Grower" eyebrows above every title.
- Scan: removed the intro paragraph (the viewfinder says "Tap a sign to scan it") and the "Two sides, one demo" panel (the role switch is in the bar).
- Stand: removed the stand description paragraph; the stamp-card rule is behind an info icon on the stamp card (popover, works on touch) and no longer repeated under the pay button; "Limit n per basket" shows once the product is in the basket; the farm rail shows 4 lines and lost its subtitle.
- Receipt after paying: removed "Élise just saw this sale land…" (the rail shows it on desktop, and the receipt already says "Paid").
- Receipts: removed the intro paragraph and the verify form's hint line; verification results are one line ("Matches the stand's ledger (block n).", "Not found on any stand ledger.", "Not a transaction hash (0x + 64 characters).").
- Grower gate: one line ("Only the stand owner gets in: Élise, in this demo."); the not-owner state is the title plus the switch button.
- Dashboard: removed the shelf editor's help line (now an info icon next to "Shelf", with the markdown hour); the "Close the day" card became one button; the sign lost its description; stat labels shortened ("Sales", "Items sold": the page title already says "Today"); the ledger shows 5 lines + "Show more"; another buyer's address is a tooltip on the sale line ("to you" stays visible).
- Close the day: the intro paragraph is an info icon next to the title; the withdraw description was removed.
- Demo controls: description 12 → 4 words, hints ≤ 5 words.
- Empty and error states cut to one line plus the next action where there is one ("Your basket is empty.", "No receipts yet." + *Find a stand*, "Nothing to withdraw yet.", "Not enough tUSDC. Nothing was charged." + *Get 25.00 test tUSDC*).
- New shared component: `src/components/ui/info-tip.tsx` (from the pilot; Radix Popover behind an info icon, re-shaped to Bazarius's 0.5rem radius and crate shadow).

French was rewritten to the same length in `src/i18n/dictionaries/fr.ts`; both dictionaries share one type, so keys stay identical. Unused keys were removed.

## 3. After

| Page | Visible before | Visible after | Change | Total before | Total after | Chrome before | Chrome after |
|-|-:|-:|-:|-:|-:|-:|-:|
| Home | 544 | 219 | −60% | 548 | 220 | 65 | 54 |
| How it works | 346 | 200 | −42% | 344 | 198 | 65 | 54 |
| Credits | 118 | 96 | −19% | 118 | 96 | 65 | 54 |
| 404 | 32 | 20 | −38% | 32 | 20 | 65 | 54 |
| App: scan | 145 | 83 | −43% | 148 | 83 | 65 | 54 |
| App: grower gate | 48 | 32 | −33% | 51 | 33 | 65 | 54 |
| App: stand shelf | 280 | 182 | −35% | 378 | 237 | 65 | 54 |
| App: receipts | 133 | 75 | −44% | 136 | 75 | 65 | 54 |
| App: farm dashboard | 389 | 260 | −33% | 402 | 266 | 65 | 54 |
| App: close the day | 113 | 75 | −34% | 130 | 90 | 65 | 54 |
| **Total** | **2,148** | **1,242** | **−42%** | **2,287** | **1,318** | **650** | **540** |

Marketing pages alone (home, how it works, credits, 404): 1,040 → 535 visible words (−49%). Most of the remaining app words are data: product names, prices, stock, ledger lines and the shelf editor's labels.

Dictionary copy: **EN 2,716 → 1,891 words (−30%)**, FR 3,058 → 2,153 (−30%). Per section (EN): meta 47 → 47 · common 115 → 92 · home 514 → 260 · how 554 → 310 · credits 82 → 60 · app 1,184 → 902 · pricing 220 → 220 (internal, unlinked page, left as is).

### Screenshots

- Before: `docs/screenshots/before/en-1440-light-page-home.png`, `docs/screenshots/before/en-1440-light-flow1-04-basket.png`.
- After: `docs/screenshots/en-1440-light-page-home.png`, `docs/screenshots/en-1440-light-flow1-04-basket.png`, and every other page and flow step in `docs/screenshots/` (EN 390/1440 light and dark, FR 390/1440 light). No screenshot was renamed or removed, so the project image did not need re-rendering.
