import type { Locale } from "@/i18n/config"

import honestyBox from "../../public/images/honesty-box.jpg"
import inTheField from "../../public/images/in-the-field.jpg"
import openStand from "../../public/images/open-stand.jpg"
import unstaffedStand from "../../public/images/unstaffed-stand.jpg"

/** Every photo on the site (free Unsplash License), with credits. See docs/assets.md. */
export const photos = {
  unstaffedStand: {
    src: unstaffedStand,
    photographer: "Rein Krijgsman",
    profile: "https://unsplash.com/@luxforma",
    page: "https://unsplash.com/photos/roadside-bloemen-stand-on-country-road-Y7GzFpRLleg",
    usedOn: { en: "home page hero", fr: "haut de la page d'accueil" },
  },
  honestyBox: {
    src: honestyBox,
    photographer: "Theo",
    profile: "https://unsplash.com/@tdponcet",
    page: "https://unsplash.com/photos/a-small-donation-box-with-the-word-merci-9UTNYnipJfM",
    usedOn: { en: "home page, “The honesty box works until it doesn't”", fr: "page d'accueil, « La boîte à l'honneur »" },
  },
  inTheField: {
    src: inTheField,
    photographer: "Heather Gill",
    profile: "https://unsplash.com/@heathergill",
    page: "https://unsplash.com/photos/man-holding-beetroots-during-daytime-VJa9L3ZVBIc",
    usedOn: { en: "home page, “For growers”", fr: "page d'accueil, « Pour les producteurs »" },
  },
  openStand: {
    src: openStand,
    photographer: "Brooke Balentine",
    profile: "https://unsplash.com/@brookebalentine",
    page: "https://unsplash.com/photos/produce-stand-with-bags-of-onions-and-tomatoes-P8AHznhxtWY",
    usedOn: { en: "How it works", fr: "Fonctionnement" },
  },
} satisfies Record<string, { src: unknown; photographer: string; profile: string; page: string; usedOn: Record<Locale, string> }>
