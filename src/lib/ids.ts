/** Generate a human-friendly order id like PKL-4821. */
export function generateOrderId(): string {
  const n = 1000 + Math.floor(Math.random() * 9000);
  return `PKL-${n}`;
}
