import { getCart } from "@/data/cart";
import { auth } from "@/lib/auth";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { CheckoutButton } from "@/components/cart/CheckoutButton";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Cart · Kerumoni" };

export default async function CartPage() {
  const session = await auth();
  const cart = await getCart();

  if (!session?.user) {
    return (
      <EmptyState
        title="Sign in to see your cart"
        subtitle="Your saved pickles live in your account."
        cta={{ href: "/login?next=/cart", label: "Sign in" }}
      />
    );
  }

  if (cart.lines.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        subtitle="Go add a jar or two of goodness."
        cta={{ href: "/shop", label: "Browse pickles" }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold text-ink">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          {cart.lines.map((line) => (
            <CartItemRow key={line.productId} line={line} />
          ))}
        </div>
        <div className="h-fit">
          <OrderSummary
            subtotal={cart.subtotal}
            shipping={null}
            total={null}
            shippingNote="Shipping is calculated at checkout from your delivery city."
          >
            <CheckoutButton count={cart.count} />
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-ink2">{subtitle}</p>
      <ButtonLink href={cta.href} className="mt-6">
        {cta.label}
      </ButtonLink>
    </div>
  );
}
