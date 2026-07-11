import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "./constants";

export type PriceableItem = { price: number; qty: number };

/** Subtotal for a set of line items (integer rupees). */
export function calcSubtotal(items: PriceableItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/** Shipping: ₹40 under the free threshold, free at/above it (and free for empty). */
export function calcShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/** Full totals breakdown for a cart. Server-authoritative. */
export function calcTotals(items: PriceableItem[]) {
  const subtotal = calcSubtotal(items);
  const shipping = calcShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}
