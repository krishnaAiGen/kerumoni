export const BRAND = {
  name: "Kerumoni",
  tagline: "Handmade in Assam",
  logo: "K",
} as const;

// Order status stages (statusIndex 0..3)
export const ORDER_STATUSES = [
  "Confirmed",
  "Packaged",
  "On the way",
  "Delivered",
] as const;

export type SpiceLevel = "MILD" | "MEDIUM" | "HOT" | "FIERY";

export const SPICE_LEVELS: SpiceLevel[] = ["MILD", "MEDIUM", "HOT", "FIERY"];

// Human labels for spice enum
export const SPICE_LABELS: Record<SpiceLevel, string> = {
  MILD: "Mild",
  MEDIUM: "Medium",
  HOT: "Hot",
  FIERY: "Fiery",
};

export type PaymentMethod = "UPI" | "CARD" | "NETBANKING";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; sub: string }[] = [
  { value: "UPI", label: "UPI", sub: "GPay · PhonePe · Paytm" },
  { value: "CARD", label: "Card", sub: "Credit / Debit" },
  { value: "NETBANKING", label: "Netbanking", sub: "All major banks" },
];

// Rotating tone colors used when the admin creates a new product
export const TONE_COLORS = ["#c98a2a", "#9d3f22", "#6a7b3f", "#b5482a", "#8f6a1e"];

// Shipping rule
export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_FEE = 40;
