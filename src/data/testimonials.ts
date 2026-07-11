import "server-only";
import { prisma } from "@/lib/db";

export function getPublishedTestimonials(limit = 12) {
  return prisma.testimonial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function getPendingTestimonials() {
  return prisma.testimonial.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
}

export function getPendingReviewCount() {
  return prisma.testimonial.count({ where: { status: "PENDING" } });
}

export type Testimonial = Awaited<ReturnType<typeof getPublishedTestimonials>>[number];
