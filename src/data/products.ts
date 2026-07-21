import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  STATIC_PRODUCTS,
  computeRating,
  hasDatabase,
  type StaticProduct,
} from "./static-products";

export type ProductWithRating = Prisma.ProductGetPayload<object> & {
  rating: number;
  reviewCount: number;
};

function staticToProduct(p: StaticProduct): ProductWithRating {
  const { reviews, ...rest } = p;
  return { ...rest, adminOnly: false, freeShipping: false, ...computeRating(reviews) };
}

/** Attach computed average rating + review count to products. */
async function withRatings(
  products: Prisma.ProductGetPayload<object>[],
): Promise<ProductWithRating[]> {
  if (products.length === 0) return [];
  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const byId = new Map(grouped.map((g) => [g.productId, g]));
  return products.map((p) => {
    const g = byId.get(p.id);
    return {
      ...p,
      rating: g?._avg.rating ? Math.round(g._avg.rating * 10) / 10 : 0,
      reviewCount: g?._count._all ?? 0,
    };
  });
}

/**
 * Product catalog reads for Home/Shop are cached so those pages don't hit the
 * (currently far-away) database on every visit. The cache is invalidated by
 * `revalidateTag("products")` whenever a product or review changes — see
 * product.actions.ts and review.actions.ts. `revalidate` is a safety-net TTL.
 */
const loadAllProducts = unstable_cache(
  async (): Promise<ProductWithRating[]> => {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
    return withRatings(products);
  },
  ["all-products"],
  { tags: ["products"], revalidate: 300 },
);

/**
 * All products. `adminOnly` items (e.g. the ₹5 live-payment test pickle) are
 * hidden from the public storefront — pass `includeAdminOnly` for admin views.
 */
export async function getAllProducts(
  opts?: { includeAdminOnly?: boolean },
): Promise<ProductWithRating[]> {
  const all = hasDatabase()
    ? await loadAllProducts()
    : STATIC_PRODUCTS.map(staticToProduct);
  return opts?.includeAdminOnly ? all : all.filter((p) => !p.adminOnly);
}

export async function getFeaturedProducts(limit = 4): Promise<ProductWithRating[]> {
  // The homepage never surfaces admin-only products.
  const all = hasDatabase()
    ? await loadAllProducts()
    : STATIC_PRODUCTS.map(staticToProduct);
  return all.filter((p) => !p.adminOnly).slice(0, limit);
}

export type ProductDetail = Prisma.ProductGetPayload<{ include: { reviews: true } }> & {
  rating: number;
  reviewCount: number;
};

export async function getProductById(id: string): Promise<ProductDetail | null> {
  if (!hasDatabase()) {
    const p = STATIC_PRODUCTS.find((x) => x.id === id);
    if (!p) return null;
    const { reviews, ...rest } = p;
    return {
      ...rest,
      adminOnly: false,
      freeShipping: false,
      reviews: reviews.map((r) => ({ ...r, productId: p.id })),
      ...computeRating(reviews),
    };
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  });
  if (!product) return null;

  const reviewCount = product.reviews.length;
  const rating =
    reviewCount > 0
      ? Math.round((product.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

  return { ...product, rating, reviewCount };
}

/** Admin listing — includes admin-only products so they're manageable. */
export async function getProductsForAdmin(): Promise<ProductWithRating[]> {
  return getAllProducts({ includeAdminOnly: true });
}
