# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (none are Unsplash+; each licence was checked on the photo's own page). They were downloaded from `images.unsplash.com`, resized to at most about 2,100 px on the long edge and compressed, and are served from `public/images/` with `next/image`. Photographers are credited on `/credits`, linked from the footer.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/unstaffed-stand.jpg` | https://unsplash.com/photos/roadside-bloemen-stand-on-country-road-Y7GzFpRLleg | Rein Krijgsman | https://unsplash.com/@luxforma | Home hero (behind the live product UI); `/credits` |
| `public/images/honesty-box.jpg` | https://unsplash.com/photos/a-small-donation-box-with-the-word-merci-9UTNYnipJfM | Theo | https://unsplash.com/@tdponcet | Home, "The honesty box works until it doesn't"; `/credits` |
| `public/images/in-the-field.jpg` | https://unsplash.com/photos/man-holding-beetroots-during-daytime-VJa9L3ZVBIc | Heather Gill | https://unsplash.com/@heathergill | Home, "For growers"; `/credits` |
| `public/images/open-stand.jpg` | https://unsplash.com/photos/produce-stand-with-bags-of-onions-and-tomatoes-P8AHznhxtWY | Brooke Balentine | https://unsplash.com/@brookebalentine | `/how-it-works` header; `/credits` |

## Brand assets

| File | Source | Used for |
|-|-|-|
| `src/components/brand/logo.tsx` | Drawn for Bazarius (price tag + sprout) | Header, footer, stand signs, 404 |
| `src/app/icon.svg`, `public/brand/bazarius-mark.svg` | Same mark, fixed colours | Favicon, Open Graph image, monark.io project image |
| `public/brand/monark-mono.svg` | `lovable-migration/brand-refs/.../logo-mono-light-standalone.svg` | "Built with Monark" footer credit only (rendered as a mask in `muted-foreground`) |

## Built in code

- Hero overlay (phone shelf, rolling tally, printing farm ticket), feature mini-visuals, stamp cards, receipts with torn edges and PAID stamp.
- Stand contract diagram (`src/components/diagrams/contract-diagram.tsx`), flat SVG line work in theme colours.
- Produce icons: [Lucide](https://lucide.dev) plus four drawn in the same style (tomato, garlic, pumpkin, jar) in `src/components/produce/produce-icon.tsx`.
- Stand QR codes: real, scannable, generated with [uqr](https://github.com/unjs/uqr).
- Open Graph image: generated per locale with `next/og` (`src/app/[locale]/opengraph-image.tsx`).
- Type: Zilla Slab and Figtree via `next/font/google`.
