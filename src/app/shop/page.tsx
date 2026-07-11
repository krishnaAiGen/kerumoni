import { getAllProducts } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata = { title: "Shop · Kerumoni" };

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mustard">The pantry</p>
      <h1 className="mt-1 font-serif text-5xl font-semibold text-ink">All pickles</h1>

      {products.length === 0 ? (
        <p className="mt-10 text-ink2">No pickles in the pantry yet — check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
