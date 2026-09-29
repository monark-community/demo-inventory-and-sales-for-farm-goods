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
- **Subheadline:** "Passers-by scan the sign, pay from their phone and take their basket. Bazarius updates the shelf, pays the stand and tells you when the eggs run low." / FR « Les passants scannent l'affiche, paient avec leur téléphone et repartent avec leur panier. Bazarius met la tablette à jour, encaisse pour vous et vous prévient quand il reste peu d'œufs. »
- **Primary CTA:** "Shop the demo stand" → `/{locale}/app/stand/trois-erables` (straight into the buyer flow, the fastest "aha").
- **Secondary CTA:** "See the grower's side" → `/{locale}/app/farm`.
- **Hero visual:** a real photo of an unstaffed roadside stand (Rein Krijgsman's "Bloemen" stand: a lone shed by a country road, fields behind, nobody there) with **live product UI** laid over it: a phone showing the shelf, and a "Meanwhile at the farm" ticket that prints each sale while the tomato count ticks down (CSS animation, paused under `prefers-reduced-motion`). Why: the photo carries the setting in one glance (no one is at this stand), the UI proves the product in the same glance (it still sells). No abstract illustration could do both.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects to the visitor's preferred language (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/` | Convince in 30 seconds, then send people into the demo | Hero (photo + live UI) · "The honesty box works until it doesn't" (photo of a real cash box, three failures, the Bazarius answer) · "One stand, two screens" (buyer shelf and grower ledger rendered from the demo's own components and seed data) · Features (four, each with a small built-in visual) · Grower band (photo of a farmer in the field + what setup takes) · Closing CTA |
| `/how-it-works` | For growers deciding whether to trust a stand to it, and for developers/students reading the mechanics | At the stand (3 steps) · At the farm (3 steps) · What the stand contract guarantees (diagram built in SVG: basket → purchase → stock + takings, with the revert paths) · Setting up a stand (the kit) · FAQ (6) · CTA |
| `/app` | Demo entry: "scan" a stand sign | Viewfinder with three stand signs to scan · nearby stands list · role explainer (shopper vs grower) |
| `/app/stand/[standId]` | Buyer flow: shelf, basket, pay, receipt | Stand header (farm, place, stand clock, markdown hour) · stamp card · shelf · basket bar/sheet · checkout panel · receipt · "Meanwhile at the farm" panel (desktop side rail) |
| `/app/receipts` | Buyer's receipts and stamp cards | Stamp cards per stand · receipt list · receipt detail with verification |
| `/app/farm` | Grower dashboard (owner wallet only) | Today at the stand (takings, sales, items sold) · alerts · live ledger · shelf editor (price, stock, limit, markdown, on/off) · stand sign (a real, scannable QR) · withdraw takings |
| `/app/farm/count` | Close the day | Count form (expected vs counted per product) · variance summary · record count · withdraw |
| `/credits` | Photo credits (linked from the footer) | Photographers, licence note, built-in assets |
| `/pricing` | **Internal strategy review only** (never linked, noindex, not in sitemap) | Tiers · rationale · assumptions |
| 404 | Localised not-found | Message + links home and to the demo |

Why each extra page exists: `/how-it-works` answers the grower's trust questions (what if someone takes more than they paid for? what if there's no signal?) that would bloat the home page; `/credits` is required by the asset rules; the `/app/*` sub-routes keep each flow linkable and each screenshot reproducible.

**Header:** Bazarius wordmark (home) · "How it works" · "Demo" (text links, active pill) · EN/FR switch · theme toggle · primary button "Open the stand" (→ `/app`). Inside `/app`, the header keeps the same shell and the app adds its own strip: role tabs (Shopper / Grower), wallet button, "Demo · simulated data" badge, demo controls.
**Mobile:** wordmark + menu button opening a full-height sheet with the links, switches and action.
**Footer:** one-line description · links (How it works, Demo, Receipts, Credits) · project page on monark.io · GitHub repo · "Demo · simulated data" · "Built with Monark" credit (mono mark, muted, 12–13px).

## 5. Feature highlights

| Feature | User benefit | Where on the site | Demo flow that proves it |
|-|-|-|-|
| **A shelf that counts itself** | Stock drops the moment a basket is paid; no end-of-day guessing | Hero ticker; home "two screens"; `/app/stand/*` tallies | Flow 1: buy, watch the tally and the farm ledger change |
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
| Eyebrow | Self-serve farm stands | Kiosques fermiers libre-service |
| H1 | Your farm stand, open while you're in the field. | Votre kiosque reste ouvert pendant que vous êtes aux champs. |
| Sub | Passers-by scan the sign, pay from their phone and take their basket. Bazarius updates the shelf, pays the stand and tells you when the eggs run low. | Les passants scannent l'affiche, paient avec leur téléphone et repartent avec leur panier. Bazarius met la tablette à jour, encaisse pour vous et vous prévient quand il reste peu d'œufs. |
| CTAs | Shop the demo stand · See the grower's side | Magasiner au kiosque démo · Voir le côté producteur |
| Hero ticket | Meanwhile at the farm · Sold: 1 basket of tomatoes · 4.50 tUSDC | Pendant ce temps, à la ferme · Vendu : 1 panier de tomates · 4,50 tUSDC |
| Problem H2 | The honesty box works until it doesn't. | La boîte à l'honneur, ça marche… jusqu'au jour où. |
| Problem body | Most roadside stands run on trust and a cash tin. It's charming, and it leaks. | La plupart des kiosques de bord de route fonctionnent à la confiance, avec une boîte de conserve. C'est sympathique, mais ça fuit. |
| Problem 1 | **Nobody carries cash anymore.** Half your passers-by drive off empty-handed. | **Plus personne n'a de monnaie.** La moitié des passants repartent les mains vides. |
| Problem 2 | **You can't tell what sold from what walked.** The tin says $40; the shelf says $70 is gone. | **Impossible de distinguer le vendu du disparu.** La boîte dit 40 $, la tablette dit 70 $. |
| Problem 3 | **You restock blind.** You find out the eggs ran out at noon when you drive by at six. | **Vous regarnissez à l'aveugle.** Vous apprenez à 18 h que les œufs sont partis à midi. |
| Answer | Bazarius keeps the trust and fixes the leaks: every basket is paid on the spot, the shelf counts itself, and your phone knows before you do. | Bazarius garde la confiance et bouche les fuites : chaque panier est payé sur place, la tablette se compte toute seule, et votre téléphone le sait avant vous. |
| Two screens H2 | One stand, two screens. | Un kiosque, deux écrans. |
| Two screens body | The passer-by sees a shelf and a pay button. You see every sale land, stock drop and alert fire, from wherever you are. | Le passant voit une tablette et un bouton pour payer. Vous voyez chaque vente arriver, le stock baisser et les alertes partir, où que vous soyez. |
| Labels | At the stand · At the farm | Au kiosque · À la ferme |
| Features H2 | Everything a stand needs, nothing it doesn't. | Tout ce qu'il faut à un kiosque, rien de plus. |
| F1 | **A shelf that counts itself.** Stock drops the second a basket is paid. No tallies on the back of an envelope. | **Une tablette qui se compte toute seule.** Le stock baisse dès qu'un panier est payé. Fini les comptes au dos d'une enveloppe. |
| F2 | **Paid before it leaves.** Payment and stock update happen in one step. If someone grabs the last braid first, the second payment simply doesn't go through. | **Payé avant de partir.** Le paiement et la mise à jour du stock se font d'un seul coup. Si quelqu'un prend la dernière tresse d'ail avant vous, le second paiement ne passe tout simplement pas. |
| F3 | **Alerts before the drive.** Pick a threshold per product. When eggs hit it, you hear about it. | **L'alerte avant le détour.** Un seuil par produit. Quand les œufs l'atteignent, vous le savez. |
| F4 | **Evening markdown.** Greens drop 30% after five, on their own. Sell the last bunch instead of composting it. | **Rabais de fin de journée.** La laitue baisse de 30 % après 17 h, toute seule. Le dernier sac se vend au lieu de finir au compost. |
| F5 | **A count that tells the truth.** Count the shelf at night; Bazarius shows what left without being paid for. | **Un décompte qui dit vrai.** Comptez la tablette le soir ; Bazarius montre ce qui est parti sans être payé. |
| F6 | **A stamp card that lives in the phone.** Six visits, three dollars off. Regulars notice. | **Une carte à tampons dans le téléphone.** Six passages, trois dollars de rabais. Les habitués le remarquent. |
| Grower H2 | Built for stands nobody has time to staff. | Pensé pour les kiosques que personne n'a le temps de tenir. |
| Grower body | Print the sign, list what's on the shelf, go back to work. Setup takes about fifteen minutes and a phone; there's no terminal to charge and no till to empty. | Imprimez l'affiche, inscrivez ce qu'il y a sur la tablette, retournez travailler. Il faut une quinzaine de minutes et un téléphone ; pas de terminal à recharger ni de caisse à vider. |
| Grower points | QR sign you print yourself · Works with any phone that has a wallet · Takings go straight to your farm wallet | Affiche QR à imprimer soi-même · Fonctionne avec tout téléphone muni d'un portefeuille · Les recettes vont directement dans le portefeuille de la ferme |
| Closing | The stand's open. Take a look around. / Open the demo stand | Le kiosque est ouvert. Faites un tour. / Ouvrir le kiosque démo |

### How it works

| Section | EN | FR |
|-|-|-|
| H1 | How a Bazarius stand works | Comment fonctionne un kiosque Bazarius |
| Intro | Two people use a stand: the passer-by who buys and the grower who stocks it. The stand contract sits between them and keeps both honest. | Deux personnes utilisent un kiosque : le passant qui achète et le producteur qui le garnit. Le contrat du kiosque se place entre les deux et garde tout le monde honnête. |
| At the stand | 1. **Scan the sign.** The QR code opens the stand's shelf in the browser. No app to install. 2. **Fill a basket and pay.** Prices come from the shelf. One confirmation in the wallet pays the stand. 3. **Take it and go.** The receipt is on the phone, and the shelf already shows one fewer. | 1. **Scannez l'affiche.** Le code QR ouvre la tablette du kiosque dans le navigateur. Aucune appli à installer. 2. **Remplissez le panier et payez.** Les prix viennent de la tablette. Une confirmation dans le portefeuille, et le kiosque est payé. 3. **Servez-vous et partez.** Le reçu est dans le téléphone, et la tablette affiche déjà un article de moins. |
| At the farm | 1. **Stock the shelf.** Prices, quantities, limits and markdowns, published in one update. 2. **Get on with the day.** Sales arrive live; an alert tells you when something runs low. 3. **Close the day.** Count what's left, see what went unpaid, withdraw the takings. | 1. **Garnissez la tablette.** Prix, quantités, limites et rabais, publiés en une seule mise à jour. 2. **Vaquez à vos occupations.** Les ventes arrivent en direct ; une alerte vous prévient quand un produit s'épuise. 3. **Fermez la journée.** Comptez ce qui reste, voyez ce qui n'a pas été payé, retirez les recettes. |
| Contract H2 | What the stand contract guarantees | Ce que garantit le contrat du kiosque |
| Guarantees | Payment and stock change together, or not at all. · You can't buy more than is on the shelf. · Only the stand owner's wallet can change prices or withdraw. · Every sale leaves a receipt anyone can check. | Le paiement et le stock changent ensemble, ou pas du tout. · On ne peut pas acheter plus que ce qu'il y a sur la tablette. · Seul le portefeuille du propriétaire peut changer les prix ou retirer l'argent. · Chaque vente laisse un reçu vérifiable par tous. |
| Kit H2 | Setting up a stand | Monter un kiosque |
| Kit | A printed QR sign (weatherproof sleeve recommended) · Your shelf, entered once from your phone · A farm wallet for the takings · Optional: a small scale for items sold by weight | Une affiche QR imprimée (pochette étanche conseillée) · Votre tablette, saisie une fois depuis le téléphone · Un portefeuille pour la ferme · Facultatif : une petite balance pour les produits au poids |

**FAQ (EN / FR)**

1. *What stops someone from taking more than they paid for?* Nothing physical, same as today. The difference is that you'll know: the evening count shows exactly what left unpaid, per product, so you can decide whether to move the stand, add a camera or shrug. / *Qu'est-ce qui empêche quelqu'un de prendre plus que ce qu'il a payé ?* Rien de physique, comme aujourd'hui. La différence, c'est que vous le saurez : le décompte du soir montre exactement ce qui est parti sans être payé, produit par produit. À vous de voir s'il faut déplacer le kiosque, ajouter une caméra ou laisser aller.
2. *What if two people buy the last dozen at the same time?* The first payment to reach the network wins. The second one doesn't go through, nobody is charged, and their basket updates to what's left. / *Et si deux personnes achètent la dernière douzaine en même temps ?* Le premier paiement arrivé sur le réseau l'emporte. Le second ne passe pas, personne n'est facturé et le panier s'ajuste à ce qui reste.
3. *Do buyers need crypto?* They need a wallet with a digital dollar in it. In this demo it's tUSDC on a test network, and a top-up button gives you some. / *Les acheteurs ont-ils besoin de cryptomonnaie ?* Il leur faut un portefeuille avec des dollars numériques. Dans cette démo, c'est du tUSDC sur un réseau de test, et un bouton permet d'en obtenir.
4. *What about bad cell coverage?* The shelf page is tiny and loads on one bar of signal. Paying needs a connection for a few seconds; a stand with no signal at all isn't a fit yet. / *Et si le réseau cellulaire est faible ?* La page de la tablette est très légère et se charge avec une seule barre. Le paiement demande quelques secondes de connexion ; un kiosque sans aucun signal n'est pas encore un bon candidat.
5. *Who holds the money?* The stand contract holds the day's takings until you withdraw them to your farm wallet. Bazarius never holds your funds. / *Qui garde l'argent ?* Le contrat du kiosque conserve les recettes du jour jusqu'à ce que vous les retiriez vers le portefeuille de la ferme. Bazarius ne détient jamais vos fonds.
6. *Can I sell by weight?* Yes: list the item per pound or kilo and leave a scale at the stand. Buyers enter the weight; the count at night keeps everyone honest. (In this demo, items are sold by unit or basket.) / *Puis-je vendre au poids ?* Oui : inscrivez le produit à la livre ou au kilo et laissez une balance au kiosque. L'acheteur entre le poids ; le décompte du soir garde tout le monde honnête. (Dans cette démo, on vend à l'unité ou au panier.)

### Demo app (key strings)

| Key | EN | FR |
|-|-|-|
| Scan H1 | Scan a stand sign | Scannez l'affiche d'un kiosque |
| Scan hint | Point your camera at the sign, or tap one below. (This demo pretends the camera found it.) | Visez l'affiche avec votre caméra, ou touchez-en une ci-dessous. (Dans cette démo, on fait semblant que la caméra l'a trouvée.) |
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
| Insufficient | Your wallet has {balance}. Top up with test tUSDC to continue. | Votre portefeuille contient {balance}. Ajoutez des tUSDC de test pour continuer. |
| Receipt | Paid. Take your basket, and thanks for stopping. | Payé. Servez-vous, et merci d'être passé. |
| Stamp full | Card full! 3.00 tUSDC off your next basket here. | Carte pleine ! 3,00 tUSDC de rabais sur votre prochain panier ici. |
| Not owner | This wallet doesn't own a stand. | Ce portefeuille ne possède aucun kiosque. |
| Draft | {n} unpublished changes | {n} modifications non publiées |
| Published | Shelf updated. The stand shows the new prices now. | Tablette mise à jour. Le kiosque affiche déjà les nouveaux prix. |
| Publish failed | The update didn't go through. Your changes are still here. | La mise à jour n'est pas passée. Vos modifications sont toujours là. |
| Unaccounted | {n} unaccounted (≈ {amount}) | {n} manquant(s) (≈ {amount}) |
| Withdraw done | {amount} is in your farm wallet. | {amount} est dans le portefeuille de la ferme. |
| Empty basket | Your basket is empty. Tap + on anything that looks good. | Votre panier est vide. Touchez + sur ce qui vous fait envie. |
| Empty receipts | No receipts yet. Your first basket will show up here. | Aucun reçu pour l'instant. Votre premier panier apparaîtra ici. |
| Empty ledger | No sales yet today. The first one will print here. | Aucune vente aujourd'hui. La première s'imprimera ici. |
| Nothing to withdraw | Nothing to withdraw. Takings appear here as the stand sells. | Rien à retirer. Les recettes s'accumulent ici au fil des ventes. |
| Storage off | Your browser isn't saving the demo, so it will reset when you leave. | Votre navigateur n'enregistre pas la démo : elle repartira à zéro à votre départ. |
| Error page | Something broke at the stand. / Try again | Quelque chose a flanché au kiosque. / Réessayer |
| 404 | This row is empty. / The page you're looking for isn't on this stand. | Cette rangée est vide. / La page que vous cherchez n'est pas sur ce kiosque. |
| Disclaimer | Demo · simulated data · Testnet demo · not financial advice · no real funds | Démo · données simulées · Démo sur réseau de test · pas un conseil financier · aucun fonds réel |

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

Built in code: logo and favicon (SVG); hero phone + farm ticket (live UI); "two screens" preview (real components, seed data); stand contract diagram (SVG); feature mini-visuals (tally, tag with markdown, alert chip, count variance, stamp card); stand QR sign (real QR via `uqr`); Open Graph image per locale (`next/og`). Icons: Lucide (produce: `Egg`, `Carrot`, `Apple`, `Wheat`, `Salad`, `Cherry`, `Flower2`, `Droplet`, `Leaf`, `Bean`, `Citrus`, `Milk`).

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
- **Extra dependency:** `uqr` (tiny, zero-dependency QR encoder) so the stand sign carries a real, scannable QR code.
