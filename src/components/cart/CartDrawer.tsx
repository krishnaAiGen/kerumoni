"use client";

import { useEffect } from "react";
import { useCartDrawer } from "./CartDrawerContext";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { open, cart, loading, closeCart, refresh } = useCartDrawer();

  // Escape to close + lock body scroll while open (mirrors Modal.tsx).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeCart]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[95] transition-opacity duration-300",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-paper shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Your cart
            {cart && cart.count > 0 ? <span className="text-ink2"> ({cart.count})</span> : null}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-1.5 text-ink2 transition-colors hover:text-ink"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6">
          {loading && !cart ? (
            <p className="py-16 text-center text-ink2">Loading…</p>
          ) : !cart || cart.lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-xl font-semibold text-ink">Your cart is empty</p>
              <p className="mt-2 text-sm text-ink2">Go add a jar or two of goodness.</p>
            </div>
          ) : (
            cart.lines.map((line) => (
              <CartItemRow key={line.productId} line={line} onChanged={refresh} />
            ))
          )}
        </div>

        {/* Footer */}
        {cart && cart.lines.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <OrderSummary subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total}>
              <ButtonLink href="/checkout" onClick={closeCart} className="mt-5 w-full">
                Proceed to checkout
              </ButtonLink>
            </OrderSummary>
          </div>
        )}
      </aside>
    </div>
  );
}
