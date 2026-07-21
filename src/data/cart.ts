import "server-only";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calcSubtotal } from "@/lib/pricing";
import { parseGrams, BOX_WEIGHT_G } from "@/lib/shipping";

export type CartLine = {
  productId: string;
  name: string;
  assameseName: string;
  price: number;
  weight: string;
  toneColor: string;
  imageUrl: string;
  qty: number;
};

/**
 * Full cart for the current user. Shipping is NOT included here — it depends on
 * the delivery city and is quoted at checkout. `weightGrams` is the total
 * shipment weight (item weights × qty + one 50 g box). Empty when logged out.
 */
export async function getCart() {
  const session = await auth();
  if (!session?.user?.id) {
    return { lines: [] as CartLine[], subtotal: 0, count: 0, weightGrams: 0 };
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });

  const lines: CartLine[] = items.map((i) => ({
    productId: i.productId,
    name: i.product.name,
    assameseName: i.product.assameseName,
    price: i.product.price,
    weight: i.product.weight,
    toneColor: i.product.toneColor,
    imageUrl: i.product.imageUrl,
    qty: i.qty,
  }));

  const subtotal = calcSubtotal(lines);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const itemGrams = lines.reduce((g, l) => g + parseGrams(l.weight) * l.qty, 0);
  const weightGrams = itemGrams > 0 ? itemGrams + BOX_WEIGHT_G : 0;

  return { lines, subtotal, count, weightGrams };
}

/** Lightweight cart item count for the navbar badge. */
export async function getCartCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;
  const agg = await prisma.cartItem.aggregate({
    where: { userId: session.user.id },
    _sum: { qty: true },
  });
  return agg._sum.qty ?? 0;
}
