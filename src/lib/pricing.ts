export type PriceableItem = { price: number; qty: number };

/** Subtotal for a set of line items (integer rupees). */
export function calcSubtotal(items: PriceableItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
