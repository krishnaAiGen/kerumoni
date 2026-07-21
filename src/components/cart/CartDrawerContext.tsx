"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { addToCart, updateCartItemQty, removeFromCart, fetchCart } from "@/actions/cart.actions";
import { useToast } from "@/components/ui/Toast";
import { calcSubtotal } from "@/lib/pricing";
import { parseGrams, BOX_WEIGHT_G } from "@/lib/shipping";
import type { CartLine } from "@/data/cart";

export type CartData = {
  lines: CartLine[];
  subtotal: number;
  count: number;
  weightGrams: number;
};

type CartDrawerContextValue = {
  open: boolean;
  cart: CartData | null;
  /** Item count for the navbar badge — kept in sync optimistically. */
  count: number;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Re-fetch the cart from the server (reconciliation). */
  refresh: () => Promise<void>;
  /** Seed the client cart from server-rendered data (e.g. on the cart page). */
  hydrate: (cart: CartData) => void;
  /** Optimistically add a line, open the drawer, and persist in the background. */
  add: (line: CartLine) => void;
  /** Optimistically set a line's quantity (0 removes it). */
  setQty: (productId: string, qty: number) => void;
  /** Optimistically remove a line. */
  remove: (productId: string) => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

/** Recompute derived totals from lines — mirrors getCart() on the server. */
function totals(lines: CartLine[]): CartData {
  const subtotal = calcSubtotal(lines);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const itemGrams = lines.reduce((g, l) => g + parseGrams(l.weight) * l.qty, 0);
  const weightGrams = itemGrams > 0 ? itemGrams + BOX_WEIGHT_G : 0;
  return { lines, subtotal, count, weightGrams };
}

export function CartDrawerProvider({
  children,
  initialCount = 0,
}: {
  children: React.ReactNode;
  initialCount?: number;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  }, []);

  const hydrate = useCallback((data: CartData) => {
    setCart(data);
    setCount(data.count);
  }, []);

  const openCart = useCallback(() => {
    setOpen(true);
    // Only fetch if we don't already have (optimistic) contents.
    setCart((c) => {
      if (c === null) void refresh();
      return c;
    });
  }, [refresh]);

  const closeCart = useCallback(() => setOpen(false), []);

  const add = useCallback(
    (line: CartLine) => {
      const hadCart = cart !== null;
      // Optimistic: merge the line and bump the badge immediately.
      setCart((prev) => {
        const existing = prev?.lines ?? [];
        const idx = existing.findIndex((l) => l.productId === line.productId);
        const lines =
          idx >= 0
            ? existing.map((l, i) => (i === idx ? { ...l, qty: l.qty + line.qty } : l))
            : [...existing, line];
        return totals(lines);
      });
      setCount((c) => c + line.qty);
      setOpen(true);

      // Persist in the background; reconcile on error or first-ever load.
      addToCart(line.productId, line.qty).then((res) => {
        if (!res.ok) {
          toast(res.error ?? "Couldn't add to cart");
          void refresh();
          return;
        }
        // If we'd never loaded the cart, fetch once to pick up pre-existing items.
        if (!hadCart) void refresh();
      });
    },
    [cart, refresh, toast],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      setCart((prev) => {
        if (!prev) return prev;
        const lines =
          qty <= 0
            ? prev.lines.filter((l) => l.productId !== productId)
            : prev.lines.map((l) => (l.productId === productId ? { ...l, qty } : l));
        const next = totals(lines);
        setCount(next.count);
        return next;
      });
      updateCartItemQty(productId, qty).then((res) => {
        if (!res.ok) {
          toast(res.error ?? "Couldn't update cart");
          void refresh();
        }
      });
    },
    [refresh, toast],
  );

  const remove = useCallback(
    (productId: string) => {
      setCart((prev) => {
        if (!prev) return prev;
        const next = totals(prev.lines.filter((l) => l.productId !== productId));
        setCount(next.count);
        return next;
      });
      removeFromCart(productId).then((res) => {
        if (!res.ok) {
          toast(res.error ?? "Couldn't remove item");
          void refresh();
        }
      });
    },
    [refresh, toast],
  );

  return (
    <CartDrawerContext.Provider
      value={{ open, cart, count, loading, openCart, closeCart, refresh, hydrate, add, setQty, remove }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  return ctx;
}
