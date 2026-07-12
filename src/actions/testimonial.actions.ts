"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { testimonialSchema } from "@/lib/validators/testimonial";
import { uploadReviewImage, isStorageConfigured } from "@/lib/supabase";

type SubmitResult = { ok: boolean; error?: string; note?: string; requiresAuth?: boolean };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Submit a customer review (goes to PENDING for admin moderation). */
export async function submitTestimonial(formData: FormData): Promise<SubmitResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, requiresAuth: true };

  const parsed = testimonialSchema.safeParse({
    userName: String(formData.get("userName") ?? ""),
    rating: Number(formData.get("rating") ?? 0),
    text: String(formData.get("text") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  // Optional photo.
  let imageUrl: string | null = null;
  let note: string | undefined;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) {
      return { ok: false, error: "The photo must be an image file." };
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { ok: false, error: "The photo must be under 5 MB." };
    }
    if (isStorageConfigured()) {
      imageUrl = await uploadReviewImage(image);
      if (!imageUrl) note = "Review submitted, but the photo couldn't be uploaded.";
    } else {
      note = "Review submitted (photo skipped — image storage isn't set up yet).";
    }
  }

  await prisma.testimonial.create({
    data: {
      userId: session.user.id,
      userName: parsed.data.userName,
      rating: parsed.data.rating,
      text: parsed.data.text,
      imageUrl,
      status: "PENDING",
    },
  });

  revalidatePath("/admin/reviews");
  return { ok: true, note };
}

export async function publishTestimonial(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Not authorized." };

  await prisma.testimonial.update({ where: { id }, data: { status: "PUBLISHED" } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { ok: true };
}

export async function rejectTestimonial(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Not authorized." };

  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  return { ok: true };
}
