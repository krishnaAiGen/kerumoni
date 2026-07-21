// India Post Speed Post shipping, computed from Guwahati (origin) to the
// customer's city. Rates are matched by weight slab × distance band.

/** Shipping origin. */
export const SHIP_ORIGIN = { name: "Guwahati", lat: 26.1445, lon: 91.7362 };

/** Packing box weight added once per order (item weights don't include it). */
export const BOX_WEIGHT_G = 50;

/** Treat destinations within this radius of Guwahati as "local". */
export const LOCAL_RADIUS_KM = 25;

export const DISTANCE_BANDS = [
  "Within city",
  "Up to 200 km",
  "201–500 km",
  "501–1,000 km",
  "1,001–2,000 km",
  "Above 2,000 km",
] as const;

// Rows = weight slab; columns = distance band (see DISTANCE_BANDS order).
// [ Within city, ≤200, 201–500, 501–1000, 1001–2000, >2000 ]
const RATES: Record<"upto50" | "upto250" | "upto500", number[]> = {
  upto50: [19, 47, 47, 47, 47, 47],
  upto250: [24, 59, 63, 68, 72, 77],
  upto500: [28, 70, 75, 82, 86, 93],
};

/** Parse a product weight string like "200g" or "1kg" to grams. */
export function parseGrams(weight: string): number {
  const m = weight.match(/([\d.]+)\s*(kg|g)?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2]?.toLowerCase() === "kg" ? Math.round(n * 1000) : Math.round(n);
}

/** Great-circle distance between two lat/lon points, in km. */
export function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Distance band index (0 = within city … 5 = above 2000 km). */
export function distanceBandIndex(distanceKm: number, local: boolean): number {
  if (local) return 0;
  if (distanceKm <= 200) return 1;
  if (distanceKm <= 500) return 2;
  if (distanceKm <= 1000) return 3;
  if (distanceKm <= 2000) return 4;
  return 5;
}

/**
 * Speed Post charge for a shipment weight (grams) at a distance band.
 * The table covers up to 500 g; heavier parcels are billed per additional
 * 500 g block at the 251–500 g rate (India-Post style).
 */
export function shippingForWeight(grams: number, bandIndex: number): number {
  if (grams <= 50) return RATES.upto50[bandIndex];
  if (grams <= 250) return RATES.upto250[bandIndex];
  if (grams <= 500) return RATES.upto500[bandIndex];
  const blocks = Math.ceil(grams / 500);
  return RATES.upto500[bandIndex] * blocks;
}
