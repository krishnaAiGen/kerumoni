import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          assameseName: product.assameseName,
          originalPrice: product.originalPrice,
          price: product.price,
          weight: product.weight,
          spiceLevel: product.spiceLevel,
          description: product.description,
          longDescription: product.longDescription,
          imageUrl: product.imageUrl,
          stock: product.stock,
          toneColor: product.toneColor,
        }}
      />
    </div>
  );
}
