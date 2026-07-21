"use client";

import Image from "next/image";
import { useCartDrawer } from "./CartDrawerContext";
import { formatMoney } from "@/lib/utils";
import type { CartLine } from "@/data/cart";

export function CartItemRow({ line }: { line: CartLine }) {
  const { setQty, remove } = useCartDrawer();

  return (
    <div className="flex items-center gap-4 border-b border-line py-4">
      <div
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
        style={{ backgroundColor: line.toneColor }}
      >
        <Image src={line.imageUrl} alt={line.name} fill unoptimized className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{line.name}</p>
        <p className="text-sm text-ink2">
          {formatMoney(line.price)} · {line.weight}
        </p>
      </div>

      <div className="flex items-center rounded-full border border-line">
        <button
          onClick={() => setQty(line.productId, line.qty - 1)}
          className="px-3 py-1.5 text-ink2 hover:text-ink"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="flex w-8 items-center justify-center text-sm text-ink">{line.qty}</span>
        <button
          onClick={() => setQty(line.productId, line.qty + 1)}
          className="px-3 py-1.5 text-ink2 hover:text-ink"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="w-20 text-right font-medium text-ink">
        {formatMoney(line.price * line.qty)}
      </div>

      <button
        onClick={() => remove(line.productId)}
        className="inline-flex items-center gap-1.5 text-sm text-terra-d hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
