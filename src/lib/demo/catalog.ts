import type { Address, Product, Stand } from "./types"

/**
 * The demo world: three self-serve stands in Québec's Eastern Townships and
 * Montérégie. Static data only (safe to import from Server Components);
 * live stock and prices live in the store.
 */

export const SHOPPER_ADDRESS: Address = "0x7a3F9c2E51b04d8A6e1f3C0b9D27a44E5c8Bc21E"
export const FARMER_ADDRESS: Address = "0x4B1dE07a9C3f82B6d5E1a0F47c9D3b2A8e6F9e02"
export const FAUCET_ADDRESS: Address = "0x00000000000000000000000000000000FA0CE7aa"
export const NETWORK_NAME = "Base Sepolia"
export const TOKEN = "tUSDC"

/** Stamp card: one stamp per purchase of at least this much; a full card is worth REWARD_VALUE. */
export const STAMP_MIN = 500
export const STAMPS_PER_CARD = 6
export const REWARD_VALUE = 300
export const FAUCET_AMOUNT = 2500

export const DEMO_STAND_ID = "trois-erables"

export const stands: Stand[] = [
  {
    id: "trois-erables",
    name: "Ferme des Trois Érables",
    farmer: "Élise Gagnon",
    place: { en: "Chemin Draper, Sutton, QC", fr: "Chemin Draper, Sutton (Qc)" },
    blurb: {
      en: "Tomatoes, corn and eggs from the farm up the lane. Pay on your phone, take what you paid for.",
      fr: "Tomates, maïs et œufs de la ferme au bout du rang. Payez sur votre téléphone, prenez ce que vous avez payé.",
    },
    markdownFrom: "17:00",
    owner: FARMER_ADDRESS,
    contract: "0x9d2C4e61A0b3f5E87c1D29aB40e6F3c7B85a1E34",
    distanceKm: 0.2,
    demoOwned: true,
  },
  {
    id: "verger-beaulieu",
    name: "Verger Beaulieu",
    farmer: "Martin Beaulieu",
    place: { en: "Rang de la Montagne, Rougemont, QC", fr: "Rang de la Montagne, Rougemont (Qc)" },
    blurb: {
      en: "Apples picked this week, cider pressed on Sundays.",
      fr: "Des pommes cueillies cette semaine, du cidre pressé le dimanche.",
    },
    markdownFrom: "18:00",
    owner: "0x2E8a61b9C04d7F35e2A1c90B6d4F8e37A5c2D71b",
    contract: "0x61Bf0a93D2e4C7185aE39c0F2b6D14e8A7c5930C",
    distanceKm: 38,
    demoOwned: false,
  },
  {
    id: "jardins-riviere",
    name: "Les Jardins de la Rivière",
    farmer: "Amara Diallo",
    place: { en: "Route 202, Hemmingford, QC", fr: "Route 202, Hemmingford (Qc)" },
    blurb: {
      en: "Roots, greens, herbs and honey from a two-acre market garden by the river.",
      fr: "Légumes-racines, verdures, fines herbes et miel d'un jardin maraîcher de deux acres, près de la rivière.",
    },
    markdownFrom: "17:30",
    owner: "0x5cA7E2d90b31F46a8D0e7C12b95F3a64E0d8B2f6",
    contract: "0xA4e07C3b9D1f62E58a0B7c4D93e1F6a2C85b0D17",
    distanceKm: 64,
    demoOwned: false,
  },
]

type P = Omit<Product, "active"> & { active?: boolean }

const p = (x: P): Product => ({ active: true, ...x })

/** Starting shelves (before the seeded sales of the day). */
export const initialProducts: Product[] = [
  // Ferme des Trois Érables
  p({ id: "tomatoes", standId: "trois-erables", icon: "tomato", tone: "beet", name: { en: "Heirloom tomatoes", fr: "Tomates ancestrales" }, unit: { en: "1 L basket", fr: "panier de 1 L" }, price: 450, stock: 16, lowAt: 4, maxPerOrder: 6, markdownPct: 0 }),
  p({ id: "corn", standId: "trois-erables", icon: "corn", tone: "marigold", name: { en: "Sweet corn", fr: "Maïs sucré" }, unit: { en: "dozen", fr: "douzaine" }, price: 700, stock: 11, lowAt: 3, maxPerOrder: 4, markdownPct: 0 }),
  p({ id: "eggs", standId: "trois-erables", icon: "egg", tone: "soil", name: { en: "Free-range eggs", fr: "Œufs de plein air" }, unit: { en: "dozen", fr: "douzaine" }, price: 650, stock: 7, lowAt: 3, maxPerOrder: 2, markdownPct: 0 }),
  p({ id: "greens", standId: "trois-erables", icon: "greens", tone: "leaf", name: { en: "Salad greens", fr: "Mesclun" }, unit: { en: "200 g bag", fr: "sac de 200 g" }, price: 500, stock: 12, lowAt: 3, maxPerOrder: 4, markdownPct: 30 }),
  p({ id: "garlic", standId: "trois-erables", icon: "garlic", tone: "slate", name: { en: "Garlic braid", fr: "Tresse d'ail" }, unit: { en: "item", fr: "unité" }, price: 1800, stock: 2, lowAt: 1, maxPerOrder: 1, markdownPct: 0 }),
  p({ id: "syrup", standId: "trois-erables", icon: "syrup", tone: "marigold", name: { en: "Maple syrup", fr: "Sirop d'érable" }, unit: { en: "540 mL can", fr: "canne de 540 mL" }, price: 1200, stock: 9, lowAt: 2, maxPerOrder: 3, markdownPct: 0 }),
  p({ id: "zucchini", standId: "trois-erables", icon: "zucchini", tone: "leaf", name: { en: "Zucchini", fr: "Courgettes" }, unit: { en: "1 kg bag", fr: "sac de 1 kg" }, price: 350, stock: 0, lowAt: 2, maxPerOrder: 4, markdownPct: 20 }),

  // Verger Beaulieu
  p({ id: "honeycrisp", standId: "verger-beaulieu", icon: "apple", tone: "beet", name: { en: "Honeycrisp apples", fr: "Pommes Honeycrisp" }, unit: { en: "2 kg bag", fr: "sac de 2 kg" }, price: 800, stock: 22, lowAt: 5, maxPerOrder: 4, markdownPct: 0 }),
  p({ id: "cortland", standId: "verger-beaulieu", icon: "apple", tone: "marigold", name: { en: "Cortland apples", fr: "Pommes Cortland" }, unit: { en: "2 kg bag", fr: "sac de 2 kg" }, price: 600, stock: 14, lowAt: 5, maxPerOrder: 4, markdownPct: 0 }),
  p({ id: "cider", standId: "verger-beaulieu", icon: "cider", tone: "soil", name: { en: "Fresh cider", fr: "Jus de pomme frais" }, unit: { en: "1 L bottle", fr: "bouteille de 1 L" }, price: 600, stock: 8, lowAt: 3, maxPerOrder: 3, markdownPct: 0 }),
  p({ id: "pumpkins", standId: "verger-beaulieu", icon: "pumpkin", tone: "marigold", name: { en: "Pie pumpkins", fr: "Citrouilles à tarte" }, unit: { en: "item", fr: "unité" }, price: 400, stock: 17, lowAt: 4, maxPerOrder: 5, markdownPct: 0 }),
  p({ id: "apple-butter", standId: "verger-beaulieu", icon: "jar", tone: "soil", name: { en: "Apple butter", fr: "Beurre de pomme" }, unit: { en: "250 mL jar", fr: "pot de 250 mL" }, price: 750, stock: 6, lowAt: 2, maxPerOrder: 2, markdownPct: 0 }),

  // Les Jardins de la Rivière
  p({ id: "carrots", standId: "jardins-riviere", icon: "carrot", tone: "marigold", name: { en: "Rainbow carrots", fr: "Carottes multicolores" }, unit: { en: "bunch", fr: "botte" }, price: 350, stock: 13, lowAt: 3, maxPerOrder: 4, markdownPct: 20 }),
  p({ id: "kale", standId: "jardins-riviere", icon: "kale", tone: "leaf", name: { en: "Lacinato kale", fr: "Chou frisé lacinato" }, unit: { en: "bunch", fr: "botte" }, price: 300, stock: 9, lowAt: 3, maxPerOrder: 4, markdownPct: 30 }),
  p({ id: "herbs", standId: "jardins-riviere", icon: "herbs", tone: "leaf", name: { en: "Herb bundle", fr: "Bouquet de fines herbes" }, unit: { en: "bunch", fr: "botte" }, price: 250, stock: 10, lowAt: 3, maxPerOrder: 5, markdownPct: 30 }),
  p({ id: "honey", standId: "jardins-riviere", icon: "honey", tone: "marigold", name: { en: "Wildflower honey", fr: "Miel de fleurs sauvages" }, unit: { en: "500 g jar", fr: "pot de 500 g" }, price: 1100, stock: 5, lowAt: 2, maxPerOrder: 2, markdownPct: 0 }),
  p({ id: "bouquet", standId: "jardins-riviere", icon: "flowers", tone: "beet", name: { en: "Cut-flower bouquet", fr: "Bouquet de fleurs coupées" }, unit: { en: "item", fr: "unité" }, price: 1200, stock: 4, lowAt: 1, maxPerOrder: 2, markdownPct: 50 }),
]

export function getStand(id: string): Stand | undefined {
  return stands.find((s) => s.id === id)
}

export function standIds(): string[] {
  return stands.map((s) => s.id)
}
