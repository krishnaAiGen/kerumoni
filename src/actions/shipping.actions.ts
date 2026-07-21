"use server";

import { auth } from "@/lib/auth";
import { getCart } from "@/data/cart";
import { quoteShipping } from "@/lib/geocode";

export type ShippingEstimate =
  | { ok: true; shipping: number; distanceKm: number; band: string; local: boolean; subtotal: number; total: number }
  | { ok: false; error: string };

/**
 * Quote Speed Post shipping from Guwahati to the given city, using the current
 * user's server-side cart weight. Used by the checkout form for a live estimate.
 */
export async function estimateShipping(city: string): Promise<ShippingEstimate> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in." };

  const trimmed = city.trim();
  if (trimmed.length < 2) return { ok: false, error: "Enter your city to calculate shipping." };

  const cart = await getCart();
  if (cart.lines.length === 0) return { ok: false, error: "Your cart is empty." };

  const quote = await quoteShipping(trimmed, cart.weightGrams);
  if (!quote) {
    return { ok: false, error: "Couldn't find that city — please check the spelling." };
  }

  return {
    ok: true,
    shipping: quote.shipping,
    distanceKm: quote.distanceKm,
    band: quote.band,
    local: quote.local,
    subtotal: cart.subtotal,
    total: cart.subtotal + quote.shipping,
  };
}
