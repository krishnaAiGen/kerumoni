import { ORDER_STATUSES } from "./constants";

/** Merge class names, dropping falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format integer rupees as ₹1,234 (Indian grouping). */
export function formatMoney(rupees: number): string {
  return "₹" + Math.round(rupees).toLocaleString("en-IN");
}

/** Format rupees showing 2 decimals only when the amount isn't whole (₹200, ₹277.78). */
export function formatMoneyExact(rupees: number): string {
  const whole = Number.isInteger(rupees);
  return (
    "₹" +
    rupees.toLocaleString("en-IN", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Selling price from an MRP and a discount percentage (rounded to whole rupees). */
export function sellingPrice(originalPrice: number, discountPercent: number): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

/** Format a date as "11 Jul 2026". */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format a date as "Jun 2026". */
export function formatMonth(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

/** Visual star string, e.g. ★★★★☆ for rating 4.x. */
export function starString(rating: number): string {
  const full = Math.round(rating);
  return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
}

/** First uppercase character of a name, for avatars. */
export function initials(name: string): string {
  return (name.trim()[0] || "?").toUpperCase();
}

/** Human label for an order statusIndex. */
export function statusLabel(statusIndex: number): string {
  return ORDER_STATUSES[Math.max(0, Math.min(statusIndex, ORDER_STATUSES.length - 1))];
}
