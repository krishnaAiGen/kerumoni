import Link from "next/link";
import Image from "next/image";
import type { ProductWithRating } from "@/data/products";
import { SpiceBadge } from "@/components/ui/SpiceBadge";
import { Stars } from "@/components/ui/Stars";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PriceTag } from "@/components/product/PriceTag";
import type { SpiceLevel } from "@/lib/constants";

export function ProductCard({ product }: { product: ProductWithRating }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper/70 transition-colors hover:border-terra/60">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden"
        style={{ backgroundColor: product.toneColor }}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3">
          <SpiceBadge level={product.spiceLevel as SpiceLevel} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-serif text-xl font-semibold text-ink hover:text-terra-d">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-ink2">
            {product.assameseName} · {product.weight}
          </p>
        </div>

        <PriceTag
          className="mt-2"
          price={product.price}
          originalPrice={product.originalPrice}
          discountPercent={product.discountPercent}
        />

        <p className="mt-2 line-clamp-2 text-sm text-ink2">{product.description}</p>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <Stars rating={product.rating} />
          <span className="text-ink2">
            {product.rating > 0
              ? `${product.rating} · ${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"}`
              : "No reviews yet"}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            className="flex-1"
          />
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            mode="buy"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
