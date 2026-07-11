import "server-only";
import { prisma } from "@/lib/db";

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId, paymentStatus: "PAID" },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });
}

export async function getAllOrders() {
  return prisma.order.findMany({
    where: { paymentStatus: "PAID" },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export type OrderWithItems = Awaited<ReturnType<typeof getUserOrders>>[number];
