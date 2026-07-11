"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { addToCart } from "@/actions/cart.actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";

export function AddToCartButton({
  productId,
  productName,
  qty = 1,
  mode = "add",
  size = "md",
  className,
}: {
  productId: string;
  productName: string;
  qty?: number;
  mode?: "add" | "buy";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const { openCart } = useCartDrawer();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const nextPath = mode === "buy" ? "/checkout" : `/products/${productId}`;

  function onClick() {
    if (status !== "authenticated") {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    setBusy(true);
    startTransition(async () => {
      const res = await addToCart(productId, qty);
      setBusy(false);
      if (res.requiresAuth) {
        router.push(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      if (!res.ok) {
        toast(res.error ?? "Something went wrong");
        return;
      }
      if (mode === "buy") {
        router.push("/checkout");
      } else {
        router.refresh(); // update the navbar cart badge
        openCart(); // slide in the cart drawer with fresh contents
      }
    });
  }

  return (
    <Button
      variant={mode === "buy" ? "primary" : "secondary"}
      size={size}
      onClick={onClick}
      loading={pending || busy}
      className={className}
    >
      {pending || busy
        ? mode === "buy"
          ? "Processing…"
          : "Adding…"
        : mode === "buy"
          ? "Buy now"
          : "Add to cart"}
    </Button>
  );
}
