import "server-only";
import { prisma } from "@/lib/db";

export async function getAdminKpis() {
  const [paidAgg, paidCount, toShip, productCount] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { paymentStatus: "PAID", statusIndex: { lt: 2 } } }),
    prisma.product.count(),
  ]);

  return {
    revenue: paidAgg._sum.total ?? 0,
    orders: paidCount,
    toShip,
    products: productCount,
  };
}

export async function getPaymentKpis() {
  const paid = await prisma.order.findMany({
    where: { paymentStatus: "PAID" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      customerName: true,
      paymentMethod: true,
      razorpayPaymentId: true,
      total: true,
      createdAt: true,
    },
  });

  const totalCollected = paid.reduce((s, o) => s + o.total, 0);
  const count = paid.length;
  const avg = count > 0 ? Math.round(totalCollected / count) : 0;

  return { totalCollected, count, avg, transactions: paid };
}
