import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { getCart } from "@/data/cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { MIN_ORDER_QTY } from "@/lib/constants";

export const metadata = { title: "Checkout · Kerumoni" };

export default async function CheckoutPage() {
  await requireUser("/checkout");
  const cart = await getCart();

  // Enforce the minimum order quantity (add-to-cart is unrestricted; checkout isn't).
  if (cart.count < MIN_ORDER_QTY) redirect("/cart");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-serif text-4xl font-semibold text-ink">Checkout</h1>
      <CheckoutForm subtotal={cart.subtotal} />
    </div>
  );
}
