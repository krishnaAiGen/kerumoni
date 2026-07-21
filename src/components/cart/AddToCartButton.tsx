"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { addToCart } from "@/actions/cart.actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import type { CartLine } from "@/data/cart";

/** Product fields needed to render an optimistic cart line. */
export type CartProduct = {
  id: string;
  name: string;
  assameseName: string;
  price: number;
  weight: string;
  toneColor: string;
  imageUrl: string;
};

export function AddToCartButton({
  product,
  qty = 1,
  mode = "add",
  size = "md",
  className,
}: {
  product: CartProduct;
  qty?: number;
  mode?: "add" | "buy";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const { add } = useCartDrawer();
  const [pending, startTransition] = useTransition();

  const nextPath = mode === "buy" ? "/checkout" : `/products/${product.id}`;

  function requireAuth(): boolean {
    if (status !== "authenticated") {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return false;
    }
    return true;
  }

  function onAdd() {
    if (!requireAuth()) return;
    // Optimistic: the drawer opens and the badge updates instantly; the
    // server write happens in the background (see CartDrawerContext).
    const line: CartLine = {
      productId: product.id,
      name: product.name,
      assameseName: product.assameseName,
      price: product.price,
      weight: product.weight,
      toneColor: product.toneColor,
      imageUrl: product.imageUrl,
      qty,
    };
    add(line);
  }

  function onBuy() {
    if (!requireAuth()) return;
    // Buy now must persist before we navigate to checkout, so we await here.
    startTransition(async () => {
      const res = await addToCart(product.id, qty);
      if (res.requiresAuth) {
        router.push(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      if (!res.ok) {
        toast(res.error ?? "Something went wrong");
        return;
      }
      router.push("/checkout");
    });
  }

  return (
    <Button
      variant={mode === "buy" ? "primary" : "secondary"}
      size={size}
      onClick={mode === "buy" ? onBuy : onAdd}
      loading={mode === "buy" && pending}
      className={className}
    >
      {mode === "buy" ? (pending ? "Processing…" : "Buy now") : "Add to cart"}
    </Button>
  );
}
