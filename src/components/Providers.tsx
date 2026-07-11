"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { CartDrawerProvider } from "@/components/cart/CartDrawerContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartDrawerProvider>
          {children}
          <CartDrawer />
        </CartDrawerProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
