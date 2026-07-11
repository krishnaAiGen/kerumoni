import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { getOrderById } from "@/data/orders";
import { ButtonLink } from "@/components/ui/Button";
import { StatusTracker } from "@/components/order/StatusTracker";
import { formatMoney, statusLabel } from "@/lib/utils";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser(`/orders/${id}`);
  const order = await getOrderById(id);

  if (!order) notFound();
  // owner-or-admin only
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") redirect("/");
  // not paid yet → send back to cart
  if (order.paymentStatus !== "PAID") redirect("/cart");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green text-3xl text-deep">
        ✓
      </div>
      <h1 className="mt-5 font-serif text-4xl font-semibold text-ink">Order placed!</h1>
      <p className="mt-2 text-ink2">
        Payment successful. Your pickles are being packed with love.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-paper/70 p-6 text-left">
        <Row label="Order ID" value={order.id} />
        <Row label="Amount paid" value={formatMoney(order.total)} />
        <Row label="Status" value={statusLabel(order.statusIndex)} accent />
        <div className="mt-5 border-t border-line pt-5">
          <StatusTracker statusIndex={order.statusIndex} />
        </div>
      </div>

      <div className="mt-7 flex justify-center gap-3">
        <ButtonLink href="/account">Track my order</ButtonLink>
        <ButtonLink href="/shop" variant="secondary">
          Keep shopping
        </ButtonLink>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-ink2">{label}</span>
      <span className={accent ? "font-semibold text-green" : "font-medium text-ink"}>{value}</span>
    </div>
  );
}
