import { getCart } from "@/data/cart";
import { auth } from "@/lib/auth";
import { CartView } from "@/components/cart/CartView";
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

  return <CartView initialCart={cart} />;
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
