import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { getCart } from "@/data/cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout · Kerumoni" };

export default async function CheckoutPage() {
  await requireUser("/checkout");
  const cart = await getCart();

  if (cart.lines.length === 0) redirect("/cart");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-serif text-4xl font-semibold text-ink">Checkout</h1>
      <CheckoutForm
        totals={{ subtotal: cart.subtotal, shipping: cart.shipping, total: cart.total }}
      />
    </div>
  );
}
