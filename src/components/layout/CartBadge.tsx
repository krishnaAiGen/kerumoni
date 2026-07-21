"use client";

import Link from "next/link";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";

/** Cart link with a live, optimistic item-count badge. */
export function CartBadge() {
  const { count } = useCartDrawer();

  return (
    <Link
      href="/cart"
      className="relative rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-terra"
    >
      Cart
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-terra px-1 text-[11px] font-bold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}
