import { formatMoney } from "@/lib/utils";

export function OrderSummary({
  subtotal,
  shipping,
  total,
  children,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper/70 p-6">
      <h2 className="font-serif text-2xl font-semibold text-ink">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink2">Subtotal</dt>
          <dd className="text-ink">{formatMoney(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink2">Shipping</dt>
          <dd className="text-ink">{shipping === 0 ? "Free" : formatMoney(shipping)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-3 text-base">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="font-semibold text-mustard">{formatMoney(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}
