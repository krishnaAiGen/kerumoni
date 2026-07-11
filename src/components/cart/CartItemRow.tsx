"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItemQty, removeFromCart } from "@/actions/cart.actions";
import { formatMoney } from "@/lib/utils";
import type { CartLine } from "@/data/cart";

export function CartItemRow({ line }: { line: CartLine }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(qty: number) {
    startTransition(async () => {
      await updateCartItemQty(line.productId, qty);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeFromCart(line.productId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4 border-b border-line py-4" data-pending={pending}>
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
          onClick={() => change(line.qty - 1)}
          disabled={pending}
          className="px-3 py-1.5 text-ink2 hover:text-ink disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm text-ink">{line.qty}</span>
        <button
          onClick={() => change(line.qty + 1)}
          disabled={pending}
          className="px-3 py-1.5 text-ink2 hover:text-ink disabled:opacity-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="w-20 text-right font-medium text-ink">
        {formatMoney(line.price * line.qty)}
      </div>

      <button
        onClick={remove}
        disabled={pending}
        className="text-sm text-terra-d hover:underline disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
