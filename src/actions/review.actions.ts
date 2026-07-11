"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators/checkout";

type ActionResult = { ok: boolean; error?: string; requiresAuth?: boolean };

export async function submitReview(
  productId: string,
  input: { rating: number; text: string },
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, requiresAuth: true };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Product not found." };

  await prisma.review.create({
    data: {
      productId,
      userName: session.user.name ?? "Anonymous",
      rating: parsed.data.rating,
      text: parsed.data.text,
    },
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/shop");
  return { ok: true };
}
