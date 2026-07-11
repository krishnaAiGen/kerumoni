"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

type ActionResult = { ok: boolean; error?: string; requiresAuth?: boolean };

async function userId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function addToCart(productId: string, qty = 1): Promise<ActionResult> {
  const uid = await userId();
  if (!uid) return { ok: false, requiresAuth: true, error: "Please sign in to add items." };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Product not found." };

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: uid, productId } },
    create: { userId: uid, productId, qty },
    update: { qty: { increment: qty } },
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCartItemQty(productId: string, qty: number): Promise<ActionResult> {
  const uid = await userId();
  if (!uid) return { ok: false, requiresAuth: true };

  if (qty <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId: uid, productId } });
  } else {
    await prisma.cartItem.updateMany({ where: { userId: uid, productId }, data: { qty } });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeFromCart(productId: string): Promise<ActionResult> {
  const uid = await userId();
  if (!uid) return { ok: false, requiresAuth: true };

  await prisma.cartItem.deleteMany({ where: { userId: uid, productId } });
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function clearCart(): Promise<ActionResult> {
  const uid = await userId();
  if (!uid) return { ok: false, requiresAuth: true };

  await prisma.cartItem.deleteMany({ where: { userId: uid } });
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true };
}
