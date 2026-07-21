"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { CartDrawerProvider } from "@/components/cart/CartDrawerContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Providers({
  children,
  initialCartCount = 0,
}: {
  children: React.ReactNode;
  initialCartCount?: number;
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartDrawerProvider initialCount={initialCartCount}>
          {children}
          <CartDrawer />
        </CartDrawerProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
