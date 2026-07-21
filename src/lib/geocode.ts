import "server-only";
import {
  SHIP_ORIGIN,
  LOCAL_RADIUS_KM,
  haversineKm,
  distanceBandIndex,
  shippingForWeight,
  DISTANCE_BANDS,
} from "./shipping";

type LatLon = { lat: number; lon: number };

// Small in-memory cache so repeated cities don't re-hit the geocoder.
const cache = new Map<string, LatLon | null>();

/** Geocode an Indian city name via OpenStreetMap Nominatim (free, no key). */
export async function geocodeCity(city: string): Promise<LatLon | null> {
  const key = city.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key)!;

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({ q: `${city}, India`, format: "json", limit: "1" }).toString();

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Kerumoni/1.0 (shipping estimate)" },
      // cache at the fetch layer for a day too
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data?.length) {
      cache.set(key, null);
      return null;
    }
    const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}

export type ShippingQuote = {
  shipping: number;
  distanceKm: number;
  band: string;
  local: boolean;
};

/**
 * Resolve a city to a Speed Post shipping quote for the given shipment weight.
 * Returns null when the city can't be geocoded.
 */
export async function quoteShipping(
  city: string,
  weightGrams: number,
): Promise<ShippingQuote | null> {
  // Nothing billable to ship (e.g. a cart of only free-shipping test items) —
  // shipping is free and we don't need to geocode the city.
  if (weightGrams <= 0) {
    return { shipping: 0, distanceKm: 0, band: DISTANCE_BANDS[0], local: true };
  }

  const isGuwahati = city.trim().toLowerCase() === SHIP_ORIGIN.name.toLowerCase();
  const dest = await geocodeCity(city);
  if (!dest) return null;

  const distanceKm = haversineKm(SHIP_ORIGIN.lat, SHIP_ORIGIN.lon, dest.lat, dest.lon);
  const local = isGuwahati || distanceKm <= LOCAL_RADIUS_KM;
  const band = distanceBandIndex(distanceKm, local);
  const shipping = shippingForWeight(weightGrams, band);

  return { shipping, distanceKm: Math.round(distanceKm), band: DISTANCE_BANDS[band], local };
}
