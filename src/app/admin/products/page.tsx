import Image from "next/image";
import Link from "next/link";
import { getProductsForAdmin } from "@/data/products";
import { ButtonLink } from "@/components/ui/Button";
import { SPICE_LABELS, type SpiceLevel } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await getProductsForAdmin();

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-ink">Products</h2>
          <ButtonLink href="/admin/products/new" size="sm">
            + New pickle
          </ButtonLink>
        </div>
        <div className="divide-y divide-line rounded-2xl border border-line bg-paper/70">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/admin/products/${p.id}/edit`}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-cream2/40"
            >
              <div
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
                style={{ backgroundColor: p.toneColor }}
              >
                <Image src={p.imageUrl} alt={p.name} fill unoptimized className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{p.name}</p>
                <p className="text-xs text-ink2">
                  {SPICE_LABELS[p.spiceLevel as SpiceLevel]} · {p.weight} · {p.reviewCount} reviews
                  · stock {p.stock}
                </p>
              </div>
              <span className="font-medium text-mustard">{formatMoney(p.price)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
