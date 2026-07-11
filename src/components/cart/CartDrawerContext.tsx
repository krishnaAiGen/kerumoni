"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { fetchCart } from "@/actions/cart.actions";
import type { CartLine } from "@/data/cart";

export type CartData = {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
};

type CartDrawerContextValue = {
  open: boolean;
  cart: CartData | null;
  loading: boolean;
  /** Open the drawer and refresh its contents. */
  openCart: () => void;
  closeCart: () => void;
  /** Re-fetch the cart (e.g. after a qty change inside the drawer). */
  refresh: () => Promise<void>;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const openCart = useCallback(() => {
    setOpen(true);
    void refresh();
  }, [refresh]);

  const closeCart = useCallback(() => setOpen(false), []);

  return (
    <CartDrawerContext.Provider value={{ open, cart, loading, openCart, closeCart, refresh }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  return ctx;
}
