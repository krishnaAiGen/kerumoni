import { getAllOrders } from "@/data/orders";
import { OrderActions } from "@/components/admin/OrderActions";
import { formatMoney, statusLabel } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  if (orders.length === 0) {
    return <p className="text-ink2">No paid orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-paper/70 text-ink2">
          <tr>
            <Th>Order</Th>
            <Th>Items</Th>
            <Th>Customer</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-line">
              <Td className="font-medium text-ink">{order.id}</Td>
              <Td className="text-ink2">
                {order.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
              </Td>
              <Td className="text-ink">{order.customerName}</Td>
              <Td className="text-ink">{formatMoney(order.total)}</Td>
              <Td>
                <span className="rounded-full bg-cream2 px-2.5 py-1 text-xs text-ink">
                  {statusLabel(order.statusIndex)}
                </span>
              </Td>
              <Td>
                <OrderActions orderId={order.id} statusIndex={order.statusIndex} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
