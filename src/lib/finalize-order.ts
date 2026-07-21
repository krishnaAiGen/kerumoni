import "server-only";
import { prisma } from "./db";
import { notifyOwnerOfOrder } from "./notify";

/**
 * Mark a CREATED order as PAID: record the payment id, decrement stock for its
 * items, and clear the buyer's cart. Idempotent — a re-run on an already-PAID
 * order is a no-op. Runs in a single transaction. On the first successful
 * transition to PAID, sends a best-effort WhatsApp alert to the shop owner.
 */
export async function finalizePaidOrder(
  orderId: string,
  razorpayPaymentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentStatus === "PAID") return { ok: true };

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", razorpayPaymentId, statusIndex: 0 },
    }),
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      }),
    ),
    prisma.cartItem.deleteMany({ where: { userId: order.userId } }),
  ]);

  // Runs only on the real CREATED→PAID transition (already-PAID returns above),
  // so the owner is alerted exactly once. Never throws — see notify.ts.
  await notifyOwnerOfOrder({
    id: order.id,
    customerName: order.customerName,
    city: order.city,
    total: order.total,
    paymentMethod: order.paymentMethod,
    items: order.items.map((i) => ({ name: i.name, qty: i.qty })),
  });

  return { ok: true };
}
