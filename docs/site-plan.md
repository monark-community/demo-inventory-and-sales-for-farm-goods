# Bazarius: site plan

Bazarius is an independent product incubated by Monark (Monark-branded: **false**). This plan is the source of truth for the rebuild on `develop`, and is kept in sync with what shipped. Decisions taken while working unattended are recorded inline and summarised in section 12.

Authoritative product description: https://www.monark.io/en/project/inventory-and-sales-for-farm-goods

---

## 1. Product brief

**Target user.** Two people, one stand:

- **The grower** (primary, the paying customer): a small farm or market gardener who sells at an unstaffed roadside stand, a shed at the end of the lane or a table by the barn. They are in the field, at the market or asleep when most sales happen. Today they use an honesty box (a cash tin with a slot) and a chalkboard.
- **The passer-by** (secondary): someone driving or cycling past who wants a dozen eggs and has no cash. They need to pay in under a minute, on their phone, standing in the gravel.

**Core job to be done.** "Let my stand sell for me while I'm not there, and tell me honestly what sold, what's left and what went missing."

**Domain concepts.**

| Concept | Meaning in Bazarius |
|-|-|
| Stand | A physical self-serve point of sale with one QR sign. Owned by one farm wallet. |
| Shelf | The stand's live product list: price, unit, stock count, per-order limit, optional evening markdown. Lives in the stand contract. |
| Basket | What the passer-by picks on their phone. Priced from the shelf at the moment of payment. |
| Purchase | One on-chain payment that, atomically, moves tUSDC to the stand and decrements stock. It reverts if stock changed underneath it. |
| Receipt | The buyer's proof: items, total, transaction hash, block. Verifiable against the stand ledger. |
| Takings | tUSDC held by the stand contract until the grower withdraws it to the farm wallet. |
| Low-stock alert | Fires when a purchase takes a product to or below its alert threshold. |
| Evening markdown | A per-product discount that applies automatically after the stand's markdown hour. |
| Shelf count | The grower's end-of-day physical count. Compared with on-chain stock, it reveals what left the stand unpaid ("unaccounted"). |
| Stamp card | Per-stand loyalty: one stamp per purchase of 5 tUSDC or more; six stamps give 3 tUSDC off the next basket. |
| Roles | The stand owner's wallet can edit the shelf, count and withdraw. Any other wallet can only buy. |

**What the Lovable version got wrong or left out.**

- **Checkout did nothing** (`handleCheckout` was a `console.log` TODO). No payment, no pending or failed state, no receipt, so the core flow never completed.
- **The two sides were not connected.** The vendor dashboard and the shop used separate hard-coded arrays: buying never changed stock and the farmer never saw a sale. The product's whole point, a stand that counts itself, was invisible.
- **No stand concept.** No QR sign to generate, no owner, no roles; "Scan QR" just navigated to a fixed page.
- **Nothing about theft or shrinkage**, the real reason honesty boxes fail, and nothing about restock alerts, markdowns or rewards, which the project documentation lists.
- **Generic crypto framing**: a picker for BTC, ETH, USDT… on a farm stand, with mainnet names and no testnet or "not financial advice" notice.
- **Generic look**: full-screen stock photo hero, green gradient, three icon cards; English only; demo-banner wrapper instead of a real demo notice.

## 2. Value proposition

> **For small farms that sell from an unstaffed roadside stand, Bazarius takes payment from a passer-by's phone, counts its own stock and tells the grower what sold, what's running low and what went missing, so the stand earns while they work, without an honesty box to empty or a card terminal that needs a cashier.**

Supporting benefits, stated as outcomes:

1. **Get paid for what leaves the stand.** Every basket is paid before it is picked up, and the evening shelf count shows exactly what didn't get paid for.
2. **Restock before the shelf runs empty, not after the drive.** An alert reaches the grower when eggs hit their threshold, wherever they are.
3. **Sell the last bunch instead of composting it.** Greens mark themselves down in the evening, automatically.

## 3. Hero

- **Headline (9 words):** "Your farm stand, open while you're in the field." / FR « Votre kiosque reste ouvert pendant que vous êtes aux champs. »
- **Subheadline (16 words):** "Passers-by scan the sign and pay from their phone. You see every sale and every low shelf." / FR « Les passants scannent l'affiche et paient avec leur téléphone. Vous voyez chaque vente et chaque tablette qui se vide. » No eyebrow, no disclaimer line under the buttons (see `docs/simplification.md`).
- **Primary CTA:** "Shop the demo stand" → `/{locale}/app/stand/trois-erables` (straight into the buyer flow, the fastest "aha").
- **Secondary CTA:** "See the grower's side" → `/{locale}/app/farm`.
- **Hero visual:** a real photo of an unstaffed roadside stand (Rein Krijgsman's "Bloemen" stand: a lone shed by a country road, fields behind, nobody there) with **live product UI** laid over it: a phone showing the shelf, and a "Meanwhile at the farm" ticket that prints each sale while the tomato count ticks down (CSS animation, paused under `prefers-reduced-motion`). Why: the photo carries the setting in one glance (no one is at this stand), the UI proves the product in the same glance (it still sells). No abstract illustration could do both.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects to the visitor's preferred language (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/` | Convince in 30 seconds, then send people into the demo | Hero (photo + live UI: the shopper's phone and the farm's ticket, i.e. both sides of one stand) · "The honesty box works until it doesn't" (photo of a real cash box, three one-line failures, one answer line) · Features (four, each with a small built-in visual: paid before it leaves, alerts, evening markdown, the count) · Grower band (photo + one line + button) · Closing CTA (heading + button) |
| `/how-it-works` | For growers deciding whether to trust a stand to it, and for developers/students reading the mechanics | One-line intro · At the stand (3 steps) · At the farm (3 steps) · What the stand contract guarantees (the diagram: basket → purchase → stock + takings + receipt, with the revert and owner-only paths) · Setting up a stand (the kit) · FAQ (5) · CTA |
| `/app` | Demo entry: "scan" a stand sign | Viewfinder with three stand signs to scan · nearby stands list |
| `/app/stand/[standId]` | Buyer flow: shelf, basket, pay, receipt | Stand header (farm, place, stand clock, markdown hour) · stamp card · shelf · basket bar/sheet · checkout panel · receipt · "Meanwhile at the farm" panel (desktop side rail) |
| `/app/receipts` | Buyer's receipts and stamp cards | Stamp cards per stand · receipt list · receipt detail with verification |
| `/app/farm` | Grower dashboard (owner wallet only) | Today at the stand (takings, sales, items sold) · alerts · live ledger · shelf editor (price, stock, limit, markdown, on/off) · stand sign (a real, scannable QR) · withdraw takings |
| `/app/farm/count` | Close the day | Count form (expected vs counted per product) · variance summary · record count · withdraw |
| `/credits` | Photo credits (linked from the footer) | Photographers, licence note, built-in assets |
| `/pricing` | **Internal strategy review only** (never linked, noindex, not in sitemap) | Tiers · rationale · assumptions |
| 404 | Localised not-found | Message + links home and to the demo |

Why each extra page exists: `/how-it-works` answers the grower's trust questions (what if someone takes more than they paid for? what if there's no signal?) that would bloat the home page; `/credits` is required by the asset rules; the `/app/*` sub-routes keep each flow linkable and each screenshot reproducible.

**Header:** Bazarius wordmark (home) · "How it works" · "Demo" (text links, active pill) · EN/FR switch · theme toggle · primary button "Open the stand" (→ `/app`). It is the only top bar on marketing pages. Inside `/app`, the app adds **one** compact bar: role switch (Shopper / Grower, icon-only on phones) and that side's pages (Stands · Receipts, or Today · Close the day, "Count" on phones) on the left; a network pill ("● Base Sepolia", icon-only on phones) that opens the demo controls, and the wallet button, on the right. No demo badge in the bar: "Demo · simulated data" lives in the footer.
**Mobile:** wordmark + menu button opening a full-height sheet with the links, switches and action.
**Footer:** one-line description · links (How it works, Demo, Receipts, Credits) · project page on monark.io · GitHub repo · "Demo · simulated data" · "Built with Monark" credit (mono mark, muted, 12–13px).

## 5. Feature highlights

| Feature | User benefit | Where on the site | Demo flow that proves it |
|-|-|-|-|
| **A shelf that counts itself** | Stock drops the moment a basket is paid; no end-of-day guessing | Hero ticker; `/app/stand/*` tallies | Flow 1: buy, watch the tally and the farm ledger change |
| **Paid before it leaves** (atomic purchase with oversell guard) | No IOUs; a buyer can't pay for the last garlic braid someone else just took | Home features; how-it-works diagram | Flow 1: "Another shopper buys first" makes the purchase revert and the basket fix itself |
| **Low-stock alerts** | Restock before the drive, not after | Home features; farm dashboard alerts | Flow 1 → Flow 3: a purchase trips the eggs alert, the grower restocks |
| **Evening markdown** | Perishables sell instead of wilting | Home features; stand clock on the shelf | Flow 3: set −30% on greens; jump the stand clock past 17:00 and the tags change |
| **Shelf count** | Theft becomes a number you can act on | Home "honesty box" section; how-it-works | Flow 4: count the shelf, see "2 tomato baskets unaccounted (9.00 tUSDC)" |
| **Stamp card and verifiable receipts** | Regulars come back; buyers can prove what they paid | `/app/receipts`; stand page | Flow 2: the sixth stamp unlocks 3 tUSDC off, then gets redeemed |

## 6. Key flows

The demo runs on a simulated **Base Sepolia** testnet with a simulated wallet holding two accounts: **your shopper wallet** (`0x7a3F…c21E`, 42.50 tUSDC) and **Élise's farm wallet** (`0x4B1d…9e02`, the owner of the Trois Érables stand). Every transaction goes: wallet prompt (confirm or reject) → pending with a hash for 1.2–2.4 s (3–6 s on "slow network") → confirmed or failed. Demo controls: fail the next transaction, "another shopper buys first", slow network, jump the stand clock, reset demo.

### Flow 1: Buy at the stand (shopper)

1. `/app`: tap the Trois Érables sign in the viewfinder (the scan animation locks on, then opens the stand).
2. Shelf: add 2 × heirloom tomatoes and 1 dozen eggs. Limits enforced (eggs max 2 per basket); sold-out items are disabled with "Sold out, back tomorrow".
3. Basket bar shows total. "Pay 15.50 tUSDC". If the wallet isn't connected, the connect prompt comes first (confirm → connected as shopper).
4. Wallet prompt: stand contract, items, amount, network fee (sponsored), "Testnet demo · not financial advice · no real funds".
   - **Rejected:** "You declined the payment. Nothing was charged." Basket kept.
5. **Pending:** "Waiting for the network…" with the hash; the basket locks.
6. **Confirmed:** receipt slides in with a "PAID" stamp; the shelf tallies tick down; a stamp is punched on the card; on desktop the "Meanwhile at the farm" rail prints the sale and, if eggs cross their threshold, a low-stock alert.
   - **Failed (network):** "The network rejected the payment. Nothing was charged." Try again.
   - **Failed (stock changed):** "Someone just bought the last one. Your basket was updated to what's left." Basket quantities clamp to the new stock.
   - **Insufficient funds:** caught before signing: "Your wallet has 4.20 tUSDC. Top up with test tUSDC" → faucet transaction.

### Flow 2: Receipts and rewards (shopper)

1. `/app/receipts`: stamp cards per stand and receipts, newest first. Empty state if none.
2. Open a receipt: items, total, time, block, hash. "Verify on the stand ledger" → checking → "Matches the stand's ledger" (or "Not found on this stand's ledger" for a tampered/unknown hash typed into the verify field).
3. The Trois Érables card starts at 5/6; the purchase in flow 1 fills it and unlocks "3.00 tUSDC off your next basket here". On the next checkout, "Use my reward" deducts it; the prompt and receipt show the discount.

### Flow 3: Restock and reprice (grower)

1. Role tab "Grower" → `/app/farm`. If the shopper account is active: "This wallet doesn't own a stand" with "Switch to Élise's farm wallet". If disconnected: connect prompt.
2. Dashboard: today's takings, sales count, items sold, alerts ("Eggs: 2 left, alert at 3").
3. Shelf editor: +12 eggs, price of sweet corn 7.00 → 6.50, greens markdown −30% after 17:00. Changes show as a draft ("3 unpublished changes"); validation: price > 0 with at most 2 decimals, stock 0–999.
4. "Publish to the stand" → wallet prompt → pending → **confirmed** ("Shelf updated. The stand shows the new prices now.") or **failed** ("The update didn't go through. Your changes are still here.").
5. Stand sign: a real QR code for the stand URL, printable.

### Flow 4: Close the day (grower)

1. `/app/farm/count`: each product with on-chain stock prefilled as "expected" and a "counted" stepper.
2. Enter counts; variances appear live: "2 unaccounted (≈ 9.00 tUSDC)" in destructive tone, surplus in neutral tone, matches with a check.
3. "Record the count" → prompt → pending → confirmed: stock is set to the counted numbers and the shrinkage is logged on the ledger. Failed: count kept, try again.
4. "Withdraw takings" (e.g. 96.50 tUSDC) → prompt → pending → confirmed: farm wallet balance rises, takings go to zero. Empty state when there's nothing to withdraw.

## 7. Content (EN / FR)

Tone: plain, warm, practical, the way a grower talks at the market: short sentences, concrete nouns (eggs, crates, the drive, the lane), no hype, no crypto jargon beyond "wallet" and "on-chain" where needed. French is written for Québec growers (« kiosque », « kiosque libre-service », « aux champs », « panier », « tablette »), not translated word for word. All copy lives in `src/i18n/dictionaries/{en,fr}.ts`; the drafts below are the source.

### Home

| Section | EN | FR |
|-|-|-|
| H1 | Your farm stand, open while you're in the field. | Votre kiosque reste ouvert pendant que vous êtes aux champs. |
| Sub | Passers-by scan the sign and pay from their phone. You see every sale and every low shelf. | Les passants scannent l'affiche et paient avec leur téléphone. Vous voyez chaque vente et chaque tablette qui se vide. |
| CTAs | Shop the demo stand · See the grower's side | Magasiner au kiosque démo · Voir le côté producteur |
| Hero ticket | Meanwhile at the farm · Sold: 1 basket of tomatoes · 4.50 tUSDC | Pendant ce temps, à la ferme · Vendu : 1 panier de tomates · 4,50 tUSDC |
| Problem H2 | The honesty box works until it doesn't. | La boîte à l'honneur, ça marche… jusqu'au jour où. |
| Problem 1 | **Nobody carries cash anymore.** Passers-by drive off empty-handed. | **Plus personne n'a de monnaie.** Les passants repartent les mains vides. |
| Problem 2 | **You can't tell sold from taken.** The tin says $40; $70 is gone. | **Vendu ou disparu? Impossible à dire.** La boîte dit 40 $; il manque 70 $. |
| Problem 3 | **You restock blind.** The eggs ran out at noon. | **Vous regarnissez à l'aveugle.** Les œufs sont partis à midi. |
| Answer | Bazarius keeps the trust and fixes the leaks. | Bazarius garde la confiance et bouche les fuites. |
| Features H2 | Everything a stand needs, nothing it doesn't. | Tout ce qu'il faut à un kiosque, rien de plus. |
| F1 | **Paid before it leaves.** Someone took the last braid first? Nothing is charged. | **Payé avant de partir.** Quelqu'un a pris la dernière tresse avant vous? Rien n'est débité. |
| F2 | **Alerts before the drive.** Eggs hit their threshold, your phone knows. | **L'alerte avant le détour.** Les œufs atteignent leur seuil, votre téléphone le sait. |
| F3 | **Evening markdown.** Greens drop 30% after five, on their own. | **Rabais de fin de journée.** Le mesclun baisse de 30 % après 17 h, tout seul. |
| F4 | **A count that tells the truth.** The evening count shows what left unpaid. | **Un décompte qui dit vrai.** Le décompte du soir montre ce qui est parti sans être payé. |
| Grower | **Built for stands nobody has time to staff.** Print the sign, list the shelf, go back to work. | **Pensé pour les kiosques que personne n'a le temps de tenir.** Imprimez l'affiche, inscrivez la tablette, retournez travailler. |
| Closing | The stand's open. Take a look around. / Open the demo stand | Le kiosque est ouvert. Faites un tour. / Ouvrir le kiosque démo |

The shelf that counts itself is shown by the hero (the tally rolls from 14 to 13 as the farm ticket prints); the stamp card lives in the demo (stand page and receipts), not on the home page.

### How it works

| Section | EN | FR |
|-|-|-|
| H1 | How a Bazarius stand works | Comment fonctionne un kiosque Bazarius |
| Intro | A passer-by, a grower, and one contract between them. | Un passant, un producteur, et un contrat entre les deux. |
| At the stand | 1. **Scan the sign.** The shelf opens. No app to install. 2. **Fill a basket and pay.** One confirmation in the wallet. 3. **Take it and go.** The receipt stays on the phone. | 1. **Scannez l'affiche.** La tablette s'ouvre. Aucune appli à installer. 2. **Remplissez le panier et payez.** Une confirmation dans le portefeuille. 3. **Servez-vous et partez.** Le reçu reste dans le téléphone. |
| At the farm | 1. **Stock the shelf.** Prices, stock and markdowns in one update. 2. **Get on with the day.** Sales arrive live; alerts flag low stock. 3. **Close the day.** Count, see what went unpaid, withdraw. | 1. **Garnissez la tablette.** Prix, stock et rabais en une mise à jour. 2. **Vaquez à vos occupations.** Les ventes arrivent en direct; les alertes signalent ce qui baisse. 3. **Fermez la journée.** Comptez, voyez ce qui manque, retirez. |
| Contract H2 | What the stand contract guarantees (carried by the diagram alone: payment and stock move together or nothing moves; owner wallet only for prices, count, withdraw; every sale leaves a receipt) | Ce que garantit le contrat du kiosque |
| Kit H2 | Setting up a stand | Monter un kiosque |
| Kit | A printed QR sign · Your shelf, entered from your phone · A farm wallet · Later: a scale, to sell by weight | Une affiche QR imprimée · Votre tablette, saisie depuis le téléphone · Un portefeuille pour la ferme · Plus tard : une balance, pour vendre au poids |

**FAQ (EN / FR)**

Five questions, answers of 12–18 words (the only FAQ on the site; "Can I sell by weight?" became the last kit line).

1. *What stops someone from taking more than they paid for?* Nothing physical, same as today. But the evening count shows exactly what left unpaid, per product.
2. *What if two people buy the last dozen at once?* The first payment wins. The second doesn't go through, and nobody is charged.
3. *Do buyers need crypto?* A wallet with digital dollars. In this demo, test tUSDC you can top up.
4. *What about bad cell coverage?* The shelf loads on one bar. A stand with no signal at all isn't a fit yet.
5. *Who holds the money?* The stand contract, until you withdraw to your farm wallet. Never Bazarius.

French answers are in `src/i18n/dictionaries/fr.ts`, written to the same length.

### Demo app (key strings)

| Key | EN | FR |
|-|-|-|
| Scan H1 | Scan a stand sign | Scannez l'affiche d'un kiosque |
| Scan hint | Tap a sign to scan it (inside the viewfinder) | Touchez une affiche pour la scanner |
| Scanning | Reading the sign… | Lecture de l'affiche… |
| Role tabs | Shopper · Grower | Client · Producteur |
| Connect | Connect demo wallet | Connecter le portefeuille démo |
| Add | Add to basket | Ajouter au panier |
| Sold out | Sold out, back tomorrow | Épuisé, de retour demain |
| Limit | Limit {n} per basket | Maximum {n} par panier |
| Pay | Pay {amount} | Payer {amount} |
| Pending | Waiting for the network… | En attente du réseau… |
| Rejected | You declined the payment. Nothing was charged. | Vous avez refusé le paiement. Rien n'a été débité. |
| Reverted | The network rejected the payment. Nothing was charged. | Le réseau a refusé le paiement. Rien n'a été débité. |
| Stock changed | Someone just bought the last one. Your basket now matches what's left. | Quelqu'un vient de prendre le dernier. Votre panier correspond maintenant à ce qui reste. |
| Insufficient | Your wallet has {balance}. + button "Get 25.00 test tUSDC" | Votre portefeuille contient {balance}. + « Obtenir 25,00 tUSDC de test » |
| Receipt | Paid. Take your basket, and thanks for stopping. | Payé. Servez-vous, et merci d'être passé. |
| Stamp full | Card full! 3.00 tUSDC off your next basket here. | Carte pleine ! 3,00 tUSDC de rabais sur votre prochain panier ici. |
| Not owner | This wallet doesn't own a stand. | Ce portefeuille ne possède aucun kiosque. |
| Draft | {n} unpublished changes | {n} modifications non publiées |
| Published | Shelf updated. The stand shows the new prices now. | Tablette mise à jour. Le kiosque affiche déjà les nouveaux prix. |
| Publish failed | The update didn't go through. Your changes are still here. | La mise à jour n'est pas passée. Vos modifications sont toujours là. |
| Unaccounted | {n} unaccounted (≈ {amount}) | {n} manquant(s) (≈ {amount}) |
| Withdraw done | {amount} is in your farm wallet. | {amount} est dans le portefeuille de la ferme. |
| Empty basket | Your basket is empty. | Votre panier est vide. |
| Empty receipts | No receipts yet. + "Find a stand" | Aucun reçu pour l'instant. + « Trouver un kiosque » |
| Empty ledger | No sales yet today. | Aucune vente aujourd'hui. |
| Nothing to withdraw | Nothing to withdraw yet. | Rien à retirer pour l'instant. |
| Storage off | This browser won't save the demo. | Ce navigateur n'enregistre pas la démo. |
| Error page | Something broke at the stand. / Try again | Quelque chose a flanché au kiosque. / Réessayer |
| 404 | This row is empty. / The page you're looking for isn't on this stand. | Cette rangée est vide. / La page que vous cherchez n'est pas sur ce kiosque. |
| Disclaimer | "Demo · simulated data" in the footer only; "Testnet demo · not financial advice · no real funds" only in the wallet prompt of a transaction that moves funds | « Démo · données simulées » (pied de page) ; « Démo sur réseau de test · pas un conseil financier · aucun fonds réel » (invite du portefeuille seulement) |

**Context on demand in the app** (info icons with popovers that open on tap): the stamp card rule ("One stamp per purchase of 5.00 tUSDC or more. Six stamps: 3.00 tUSDC off."), how shelf updates and the markdown hour work (next to "Shelf"), how the evening count works (next to "Close the day"). No intro paragraphs above the scan, receipts, dashboard or count screens. The per-basket limit shows once a product is in the basket. Ledgers show 4 lines (farm rail) or 5 lines + "Show more" (dashboard); another buyer's address is a tooltip on the sale line.

## 8. Aesthetics (independent identity)

**Concept: "Hand-painted sign, honest ledger."** Bazarius should feel like the best roadside stand you've stopped at: a painted sign, crates, a clipboard with neat numbers. Growers distrust anything that looks like a fintech app or a crypto casino; passers-by are on a gravel shoulder in bright sun. So: warm paper surfaces, a single deep produce colour, slab-serif signage for names and prices, a no-nonsense sans for everything else, and receipts that look like receipts. It is rural without being rustic kitsch (no fake wood grain, no chalk fonts, no burlap).

**Palette.** Primary is **beet**: a deep magenta-red taken from beets, radicchio and rhubarb. It is food-real, warm, legible in sunlight and unlike both Monark orange and the green-on-green of every "farm app". **Marigold** is the accent (price-tag highlights, stamps). **Leaf** green is reserved for success; **vermilion** for destructive. The dark theme is **"after dusk"**: a deep green-black like a field at night, with chalk-white text and a lighter beet.

| Role | Light | Dark |
|-|-|-|
| `background` | `#F3EEE3` oat paper | `#161A15` field at night |
| `foreground` | `#211B14` soil | `#F0EADD` chalk |
| `card` / `popover` | `#FBF8F1` | `#1F241E` |
| `primary` | `#8A2A4F` beet | `#E890B5` beet, lifted |
| `primary-foreground` | `#FFF7F2` | `#22101A` |
| `secondary` | `#E6DDCB` | `#2D332B` |
| `muted` | `#E9E2D4` | `#2A2F28` |
| `muted-foreground` | `#5F5446` | `#B7AE9D` |
| `accent` | `#F2C14E` marigold | `#F2C14E` |
| `accent-foreground` | `#211B14` | `#161A15` |
| `border` | `#D8CCB6` | `#394036` |
| `input` (field outlines) | `#978770` | `#6E7766` |
| `ring` | `#8A2A4F` | `#E890B5` |
| `destructive` | `#B23A12` vermilion | `#F2825D` |
| `success` (custom) | `#2F6B3A` leaf | `#86C98A` |
| `warning` (custom) | `#8A5A00` | `#E9B949` |
| `chart-1…5` | `#8A2A4F` beet · `#3F7D45` leaf · `#B9861A` marigold · `#7A5B3A` soil · `#4F6D7A` slate | `#E890B5` · `#86C98A` · `#F2C14E` · `#C9A27A` · `#8FB3C2` |

WCAG AA checks (computed with the WCAG 2.1 formula):

| Pair | Light | Dark |
|-|-|-|
| foreground / background | 14.74 | 14.69 |
| foreground / card | 16.08 | 13.18 |
| foreground / muted | 13.23 | 11.41 |
| muted-foreground / background | 6.38 | 8.01 |
| muted-foreground / card | 6.96 | 7.19 |
| muted-foreground / muted | 5.73 | 6.22 |
| primary-foreground / primary | 7.86 | 7.85 |
| primary as text / background | 7.19 | 7.62 |
| primary as text / card | 7.84 | 6.84 |
| accent-foreground / accent | 10.16 | 10.49 |
| foreground / secondary | 12.64 | 10.81 |
| destructive-foreground / destructive | 5.99 (white) | 6.81 |
| destructive as text / card | 5.65 | 6.11 |
| success as text / card | 6.03 | 8.08 |
| warning as text / card | 5.59 | 8.65 |
| input outline / background (non-text, needs 3:1) | 3.02 | 3.77 |
| ring / background (non-text, needs 3:1) | 7.19 | 7.62 |

`border` (1.37 / 1.64) is decorative only; every interactive control uses `input` or a filled background for its boundary.

**Type.** Two families via `next/font/google`:

- **Zilla Slab** (600, 700): display headings, stand and product names, prices and tallies. A slab serif reads like stencilled crate labels and painted signs, and its figures are sturdy at a glance.
- **Figtree** (400, 500, 600, 700): body, UI, forms. Friendly, very legible on small screens in sunlight, with tabular figures for ledgers.

Scale (rem, mobile → desktop): display 2.5 → 4.25 (Zilla 700, −0.02em), h2 1.875 → 2.75, h3 1.25 → 1.5, body 1 (line-height 1.6), small 0.875, micro/eyebrow 0.75 uppercase +0.08em (Figtree 700). Prices use Zilla 700 with tabular figures.

**Logo.** A price tag (a rounded tag with a punched hole and string) in beet, holding a small two-leaf sprout cut out of it, next to the "Bazarius" wordmark set in Zilla Slab 700. The mark alone is the favicon (`src/app/icon.svg`) and appears on the QR stand sign. Built in SVG in `src/components/brand/logo.tsx`.

**Shape.** Radius 0.5rem for cards and inputs, full pills only for small tags and the locale switch. 1px borders. Depth is flat: no blurred shadows; raised items (cards being hovered, the phone mock) get a hard 2–3px offset "crate" shadow in `border`/`foreground` tint. Receipts have a zig-zag torn edge and dashed perforations; price tags have a notched corner. Motion: 150–250 ms ease-out; tallies roll digits; the PAID stamp lands with a 250 ms scale-and-settle; the stamp card punch pops; everything is disabled under `prefers-reduced-motion`.

**Imagery.** Photography: real, unstaffed stands and working growers in natural daylight: empty sheds by the road, a cash box on a post, hands in the field. No posed smiles, no people looking at phones, no overhead flat-lays. Illustration: none; product visuals are the real UI plus one diagram (the stand contract) drawn in flat SVG line work in `foreground`, beet and marigold. Produce is shown with Lucide icons on coloured crate labels, never stock product photos.

**Signature moments.**

1. **The farm prints the sale.** Paying at the stand makes a paper ticket print into the "Meanwhile at the farm" rail while the shelf tally rolls down by one. Cause and effect on one screen.
2. **The PAID stamp and the punch.** The receipt lands with a rubber-stamp "PAID" in beet and the stamp card gets a hole punched; the sixth punch flips the card to "reward".
3. **The evening count.** In the shelf count, variances fill in as you type: a vermilion "2 unaccounted (≈ 9.00 tUSDC)" appears next to the tomatoes. Theft becomes a number.

**Deliberately avoided.** Purple/blue gradients and anything "AI" (wrong audience, and the other incubated brands must not converge); frosted glass and neon (illegible outdoors); glowing coins and crypto imagery (growers distrust it; the money is just dollars to them); green-on-green farm clichés and the Lovable version's gradient (every agritech site); rustic kitsch (wood-grain textures, chalkboard fonts, burlap) that reads as a craft-fair template; the default shadcn look (zinc greys, soft shadows, rounded-xl cards everywhere); Monark orange as a primary.

## 9. Assets

| File | Purpose | Placement |
|-|-|-|
| `public/images/unstaffed-stand.jpg` (Rein Krijgsman, "Bloemen" stand) | An empty roadside stand: the product's setting | Home hero background panel |
| `public/images/honesty-box.jpg` (Theo, "Caisse / Merci" cash box) | The problem: the honesty box | Home "honesty box" section |
| `public/images/in-the-field.jpg` (Heather Gill, farmer holding beets) | Where the grower actually is | Home grower band |
| `public/images/open-stand.jpg` (Brooke Balentine, roadside "OPEN" stand) | A stand that sells by itself | `/how-it-works` header |

All free Unsplash License, listed with URLs and photographers in `docs/assets.md` and credited on `/credits`.

Built in code: logo and favicon (SVG); hero phone + farm ticket (live UI); stand contract diagram (SVG); feature mini-visuals (paid/reverted, alert chip, tag with markdown, count variance); stand QR sign (real QR via `uqr`); Open Graph image per locale (`next/og`). Icons: Lucide (produce: `Egg`, `Carrot`, `Apple`, `Wheat`, `Salad`, `Cherry`, `Flower2`, `Droplet`, `Leaf`, `Bean`, `Citrus`, `Milk`).

## 10. Pricing strategy

Model: **per-sale fee with a free entry tier, plus a flat monthly plan for busier farms.** Buyers never pay a fee; network fees are sponsored by Bazarius on an L2 (fractions of a cent per sale).

| Plan | Price | For | Includes |
|-|-|-|-|
| **Roadside** | Free + 1.5% per sale | One stand, trying it out | 1 stand, 25 products, alerts, receipts |
| **Farm** | 9 USD / month + 0.75% per sale | A farm with a real stand business | 3 stands, markdown rules, shelf-count history, stamp cards, SMS alerts |
| **Co-op** | 39 USD / month + 0.5% per sale | Co-ops and farm networks | 20 stands, multiple growers per stand with split takings, CSV export |

Reasoning: growers compare against card terminals (roughly 2.6–2.9% plus hardware, and they need power and a person) and against the honesty box (free but leaky). A percentage-only free tier removes any risk of trying it; the Farm plan pays for itself at about 1,200 USD a month in stand sales, which a busy summer stand clears; the Co-op plan prices in the split-takings feature Monark's profit-distribution work makes possible. Amounts and break-even figures are planning assumptions to be validated with growers.

`/pricing` exists **for internal strategy review only**: never linked from anywhere, excluded from `sitemap.xml`, `robots: { index: false, follow: false }`. No other page mentions prices of the service.

## 11. Out of scope

- Real wallets, signing, chains or contracts; real camera QR scanning (the viewfinder is simulated; the printed QR is real and opens the stand page).
- Accounts, email/SMS delivery (alerts are shown in-app only), backends, analytics.
- Selling by weight, multiple stands per grower, co-op split payouts, card payments or fiat on-ramps.
- Offline payment queuing for no-signal stands.
- Tax, accounting or food-safety compliance.

## 12. Decisions made unattended

- **Setting:** stands in Québec's Eastern Townships and Montérégie, because Monark is Montréal-based and the bilingual audience is real there. Prices are in **tUSDC** (testnet), the token the Monark demo family uses for dollar amounts.
- **Network:** simulated Base Sepolia (cheap L2 fits micro-payments).
- **Roles:** a single simulated wallet with two accounts (shopper and farm owner) so one visitor can play both sides; the grower area checks ownership and shows a real "not the owner" state.
- **Stand clock:** markdowns depend on the stand's local time; the demo clock follows the visitor's clock and can be jumped past 17:00 from the demo controls.
- **Photos:** found through Unsplash's public pages; only free-licence images, verified on each photo page.
- **Registry components:** re-themed `@monark` `wallet`, `connect-wallet`, `token-amount`, `network-badge`, `tx-status`; no `swap-form` or `nft-card` (no swap, and the stamp card is not presented as an NFT to growers).
- **Extra dependency:** `uqr` (tiny, zero-dependency QR encoder) so the stand sign carries a real, scannable QR code. `react-jazzicon` comes with the registry `wallet` component.
- **Toasts** are used only for background events (demo reset, a passer-by purchase, a test top-up): bottom-left on desktop, clear of the basket, receipt and farm rail on the right; top of the screen on phones, clear of the basket bar. Every flow result is shown inline where the action happened.
- **Layout on phones:** the basket is a bottom bar that opens a sheet (checkout and receipt live there); the farm rail sits under the shelf; on the grower dashboard alerts come before the shelf editor.
- **Units** read as "per dozen / par douzaine"; single items are "per item / par unité".
- **Header:** as an independent brand, Bazarius keeps its own header (wordmark, two links, EN/FR, theme, "Open the stand"); the Monark standard header does not apply.
- **Simplification pass** (owner feedback, brand guidelines §8 "Restraint"): about 42% fewer visible words; one app bar instead of two stacked rows; no eyebrows or intro paragraphs; "One stand, two screens" folded into the hero. Details and before/after counts in `docs/simplification.md`.
