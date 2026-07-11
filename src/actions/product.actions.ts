"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { productSchema, type ProductInput } from "@/lib/validators/product";
import { TONE_COLORS } from "@/lib/constants";
import { discountPercentOf } from "@/lib/utils";

type ActionResult = { ok: boolean; error?: string; id?: string };

async function assertAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Not authorized." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  }
  const d = parsed.data;

  const count = await prisma.product.count();
  const tone = d.toneColor ?? TONE_COLORS[count % TONE_COLORS.length];

  const product = await prisma.product.create({
    data: {
      name: d.name,
      assameseName: d.assameseName,
      originalPrice: d.originalPrice,
      price: d.price,
      discountPercent: discountPercentOf(d.originalPrice, d.price),
      weight: d.weight,
      spiceLevel: d.spiceLevel,
      toneColor: tone,
      description: d.description,
      longDescription: d.longDescription,
      imageUrl: d.imageUrl,
      stock: d.stock,
    },
  });

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, id: product.id };
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Not authorized." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  }
  const d = parsed.data;

  await prisma.product.update({
    where: { id },
    data: {
      name: d.name,
      assameseName: d.assameseName,
      originalPrice: d.originalPrice,
      price: d.price,
      discountPercent: discountPercentOf(d.originalPrice, d.price),
      weight: d.weight,
      spiceLevel: d.spiceLevel,
      description: d.description,
      longDescription: d.longDescription,
      imageUrl: d.imageUrl,
      stock: d.stock,
      ...(d.toneColor ? { toneColor: d.toneColor } : {}),
    },
  });

  revalidatePath("/shop");
  revalidatePath(`/products/${id}`);
  revalidatePath("/admin/products");
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Not authorized." };
  await prisma.product.delete({ where: { id } });
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { ok: true };
}
