import { requireUser } from "@/lib/auth-guards";
import { getUserOrders } from "@/data/orders";
import { StatusTracker } from "@/components/order/StatusTracker";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate, formatMoney } from "@/lib/utils";

export const metadata = { title: "My account · Kerumoni" };

export default async function AccountPage() {
  const session = await requireUser("/account");
  const orders = await getUserOrders(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold text-ink">
        Hi, {session.user.name?.split(" ")[0] ?? "there"}
      </h1>
      <p className="mt-1 text-ink2">{session.user.email}</p>

      <h2 className="mt-10 font-serif text-2xl font-semibold text-ink">Your orders</h2>

      {orders.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-paper/60 p-8 text-center">
          <p className="text-ink2">No orders yet.</p>
          <ButtonLink href="/shop" className="mt-4" size="sm">
            Start shopping →
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-line bg-paper/70 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{order.id}</p>
                  <p className="text-xs text-ink2">{formatDate(order.createdAt)}</p>
                </div>
                <p className="font-serif text-xl font-semibold text-mustard">
                  {formatMoney(order.total)}
                </p>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-ink2">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} × {item.qty}
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-line pt-5">
                <StatusTracker statusIndex={order.statusIndex} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
