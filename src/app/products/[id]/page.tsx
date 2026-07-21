import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/data/products";
import { auth } from "@/lib/auth";
import { SpiceBadge } from "@/components/ui/SpiceBadge";
import { Stars } from "@/components/ui/Stars";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ReviewForm } from "@/components/product/ReviewForm";
import { PriceTag } from "@/components/product/PriceTag";
import { formatMonth, initials } from "@/lib/utils";
import type { SpiceLevel } from "@/lib/constants";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  // Admin-only products (e.g. the test pickle) aren't visible to customers.
  if (product.adminOnly) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div
          className="relative aspect-square overflow-hidden rounded-3xl border border-line"
          style={{ backgroundColor: product.toneColor }}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover"
          />
          <span className="absolute left-4 top-4">
            <SpiceBadge level={product.spiceLevel as SpiceLevel} />
          </span>
        </div>

        <div>
          <h1 className="font-serif text-4xl font-semibold text-ink">{product.name}</h1>
          <p className="mt-1 text-lg text-ink2">
            {product.assameseName} · {product.weight}
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <Stars rating={product.rating} />
            <span className="text-ink2">
              {product.rating > 0
                ? `${product.rating} · ${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"}`
                : "No reviews yet"}
            </span>
          </div>

          <PriceTag
            className="mt-5"
            size="lg"
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercent={product.discountPercent}
          />

          <p className="mt-5 text-ink2">{product.longDescription}</p>

          <p className="mt-4 text-sm text-ink2">
            {product.stock > 0 ? (
              <span className="text-green">In stock</span>
            ) : (
              <span className="text-terra-d">Out of stock</span>
            )}
          </p>

          <div className="mt-6 flex gap-3">
            <AddToCartButton product={product} size="lg" className="flex-1" />
            <AddToCartButton product={product} mode="buy" size="lg" className="flex-1" />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-ink">
            Reviews {product.reviewCount > 0 && <span className="text-ink2">({product.reviewCount})</span>}
          </h2>
          <div className="mt-5 space-y-4">
            {product.reviews.length === 0 && (
              <p className="text-ink2">Be the first to review this pickle.</p>
            )}
            {product.reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-paper/60 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-mustard text-sm font-bold text-deep">
                    {initials(r.userName)}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{r.userName}</p>
                    <p className="text-xs text-ink2">{formatMonth(r.createdAt)}</p>
                  </div>
                  <span className="ml-auto">
                    <Stars rating={r.rating} />
                  </span>
                </div>
                <p className="mt-3 text-ink2">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <ReviewForm />
      </div>
    </div>
  );
}
