"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItemQty, removeFromCart } from "@/actions/cart.actions";
import { formatMoney } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import type { CartLine } from "@/data/cart";

export function CartItemRow({
  line,
  onChanged,
}: {
  line: CartLine;
  /** Called after a qty/remove mutation — used by the cart drawer to re-fetch. */
  onChanged?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"qty" | "remove" | null>(null);

  function change(qty: number) {
    setAction("qty");
    startTransition(async () => {
      await updateCartItemQty(line.productId, qty);
      router.refresh();
      onChanged?.();
      setAction(null);
    });
  }

  function remove() {
    setAction("remove");
    startTransition(async () => {
      await removeFromCart(line.productId);
      router.refresh();
      onChanged?.();
      setAction(null);
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
        <span className="flex w-8 items-center justify-center text-sm text-ink">
          {action === "qty" ? <Spinner className="h-3.5 w-3.5" /> : line.qty}
        </span>
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
        className="inline-flex items-center gap-1.5 text-sm text-terra-d hover:underline disabled:opacity-50"
      >
        {action === "remove" && <Spinner className="h-3 w-3" />}
        {action === "remove" ? "Removing…" : "Remove"}
      </button>
    </div>
  );
}
