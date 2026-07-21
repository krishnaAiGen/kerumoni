"use client";

import { useEffect } from "react";
import { useCartDrawer, type CartData } from "./CartDrawerContext";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";
import { CheckoutButton } from "./CheckoutButton";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Client cart page. Seeds the shared cart context from server-rendered data,
 * then renders lines/totals from that context so quantity and remove actions
 * update instantly (optimistic) and stay in sync with the cart drawer.
 */
export function CartView({ initialCart }: { initialCart: CartData }) {
  const { cart, hydrate } = useCartDrawer();

  useEffect(() => {
    hydrate(initialCart);
  }, [hydrate, initialCart]);

  // Fall back to the server snapshot until the hydrate effect runs.
  const view = cart ?? initialCart;

  if (view.lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-ink2">Go add a jar or two of goodness.</p>
        <ButtonLink href="/shop" className="mt-6">
          Browse pickles
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold text-ink">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          {view.lines.map((line) => (
            <CartItemRow key={line.productId} line={line} />
          ))}
        </div>
        <div className="h-fit">
          <OrderSummary
            subtotal={view.subtotal}
            shipping={null}
            total={null}
            shippingNote="Shipping is calculated at checkout from your delivery city."
          >
            <CheckoutButton count={view.count} />
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
