import "server-only";
import { prisma } from "./db";

/**
 * Mark a CREATED order as PAID: record the payment id, decrement stock for its
 * items, and clear the buyer's cart. Idempotent — a re-run on an already-PAID
 * order is a no-op. Runs in a single transaction.
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

  return { ok: true };
}
