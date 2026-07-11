import type { SpiceLevel } from "@/lib/constants";

/**
 * Built-in catalog used when no database is configured (DATABASE_URL unset).
 * Lets the storefront (landing, shop, product detail) run with zero infra.
 * Mirrors prisma/seed.ts so switching to a real DB is seamless.
 */
export type StaticReview = {
  id: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date;
};

export type StaticProduct = {
  id: string;
  name: string;
  assameseName: string;
  originalPrice: number;
  discountPercent: number;
  price: number;
  weight: string;
  spiceLevel: SpiceLevel;
  toneColor: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  stock: number;
  createdAt: Date;
  reviews: StaticReview[];
};

// Fixed timestamp so nothing depends on Date.now() at render time.
const T = new Date("2026-01-01T00:00:00Z");

function review(id: string, userName: string, rating: number, text: string): StaticReview {
  return { id, userName, rating, text, createdAt: T };
}

export const STATIC_PRODUCTS: StaticProduct[] = [
  {
    id: "garlic",
    name: "Garlic Pickle",
    assameseName: "ৰসুনৰ আচাৰ",
    originalPrice: 165,
    discountPercent: 9,
    price: 150,
    weight: "200g",
    spiceLevel: "MEDIUM",
    toneColor: "#c98a2a",
    description: "Whole garlic cloves in cold-pressed mustard oil with red chilli and hand-ground spice.",
    longDescription:
      "Whole garlic cloves slow-cured in cold-pressed mustard oil with salt, red chilli, turmeric and fenugreek. Mellow, sticky and deeply savoury — it lifts dal, rice and parathas alike. No preservatives added.",
    imageUrl: "/products/garlic.png",
    stock: 40,
    createdAt: T,
    reviews: [
      review("g1", "Ananya Das", 5, "Tastes exactly like my grandmother made in Nagaon. The oil, the spice — perfect."),
      review("g2", "Rahul Mehta", 4, "Lovely garlic flavour, not too spicy. Great with rice."),
    ],
  },
  {
    id: "amla",
    name: "Amla Pickle",
    assameseName: "আমলাখি আচাৰ",
    originalPrice: 200,
    discountPercent: 10,
    price: 180,
    weight: "200g",
    spiceLevel: "MILD",
    toneColor: "#6a7b3f",
    description: "Whole Indian gooseberries in mustard oil and gentle spice — tangy and rich in vitamin C.",
    longDescription:
      "Whole amla (Indian gooseberry) softened and folded into a mild, tangy masala with cold-pressed mustard oil, turmeric and fenugreek. Bright, healthy and gentle on the palate — an everyday favourite. No preservatives added.",
    imageUrl: "/products/amla.png",
    stock: 50,
    createdAt: T,
    reviews: [
      review("a1", "Meghna R", 5, "Tangy and healthy. I have a spoon every morning."),
      review("a2", "Kaushik Dutta", 4, "Lovely balance of sour and spice. Not overpowering."),
    ],
  },
  {
    id: "chicken",
    name: "Chicken Pickle",
    assameseName: "মুৰ্গী মাংস আচাৰ",
    originalPrice: 280,
    discountPercent: 11,
    price: 250,
    weight: "200g",
    spiceLevel: "HOT",
    toneColor: "#7a2f1e",
    description: "Tender boneless chicken slow-cooked in mustard oil and roasted spices. 100% natural.",
    longDescription:
      "Boneless chicken slow-cooked with cold-pressed mustard oil and hand-roasted spices until dark, glossy and intensely savoury. A protein-rich pickle that eats like a meal on its own. 100% natural, no preservatives.",
    imageUrl: "/products/chicken.png",
    stock: 20,
    createdAt: T,
    reviews: [
      review("ch1", "Priyanka Bora", 5, "Absolutely addictive. The chicken is tender and the heat is spot on."),
      review("ch2", "Sameer Khan", 5, "Best chicken pickle I've had, ships fresh."),
    ],
  },
  {
    id: "mango",
    name: "Mango Chilli Pickle",
    assameseName: "আম জলকীয়া আচাৰ",
    originalPrice: 165,
    discountPercent: 9,
    price: 150,
    weight: "200g",
    spiceLevel: "HOT",
    toneColor: "#c76a28",
    description: "Raw mango and red chilli in mustard oil — tangy, hot and vibrant. 100% natural.",
    longDescription:
      "Sun-ripened raw mango cubes tossed with red chilli, mustard and a hand-ground spice blend in cold-pressed mustard oil. Tangy, punchy and vibrant — the perfect kick alongside rice and rotis. 100% natural, no preservatives.",
    imageUrl: "/products/mango-chilli.png",
    stock: 35,
    createdAt: T,
    reviews: [
      review("m1", "Priyanka Bora", 5, "The mango-chilli combo is addictive. Perfect tang and heat."),
      review("m2", "Sameer Khan", 4, "Fresh and zingy, tastes properly homemade."),
    ],
  },
  {
    id: "ghost",
    name: "Ghost Pepper Pickle",
    assameseName: "ভোট জলকীয়া আচাৰ",
    originalPrice: 280,
    discountPercent: 11,
    price: 250,
    weight: "200g",
    spiceLevel: "FIERY",
    toneColor: "#9d2f22",
    description: "Bhut jolokia (ghost pepper) slow-cooked into a fiery mustard-oil pickle. 100% natural.",
    longDescription:
      "Assam's legendary bhut jolokia (ghost pepper) slow-cooked into a thick, fiery pickle with mustard oil and roasted spices. Extreme heat with real flavour — a little goes a very long way. 100% natural, no preservatives.",
    imageUrl: "/products/ghost-pepper.png",
    stock: 25,
    createdAt: T,
    reviews: [
      review("gp1", "Deep Saikia", 5, "Properly fiery! Exactly the bhut jolokia burn I wanted."),
      review("gp2", "Ritu Kalita", 4, "Intense heat but you can still taste the pickle. Handle with care."),
    ],
  },
];

export function computeRating(reviews: StaticReview[]): { rating: number; reviewCount: number } {
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : 0;
  return { rating, reviewCount };
}

/** True when a Postgres database is configured. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}
