"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createProduct, updateProduct } from "@/actions/product.actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { SPICE_LEVELS, SPICE_LABELS } from "@/lib/constants";
import type { ProductInput } from "@/lib/validators/product";

type ExistingProduct = ProductInput & { id: string };

export function ProductForm({ product }: { product?: ExistingProduct }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const presign = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      }).then((r) => r.json());

      if (!presign.ok) {
        setError(presign.error ?? "Upload not available — paste an image URL instead.");
        return;
      }

      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) {
        setError("Upload failed.");
        return;
      }
      setImageUrl(presign.publicUrl);
      toast("Image uploaded");
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const input: ProductInput = {
      name: String(form.get("name") ?? ""),
      assameseName: String(form.get("assameseName") ?? ""),
      price: Number(form.get("price") ?? 0),
      weight: String(form.get("weight") ?? ""),
      spiceLevel: form.get("spiceLevel") as ProductInput["spiceLevel"],
      description: String(form.get("description") ?? ""),
      longDescription: String(form.get("longDescription") ?? ""),
      stock: Number(form.get("stock") ?? 0),
      imageUrl,
      toneColor: (String(form.get("toneColor") ?? "").trim() || undefined) as
        | string
        | undefined,
    };

    startTransition(async () => {
      const res = isEdit
        ? await updateProduct(product.id, input)
        : await createProduct(input);
      if (!res.ok) {
        setError(res.error ?? "Could not save product.");
        return;
      }
      toast(isEdit ? "Product updated" : "Pickle published");
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-paper/70 p-6">
      <h3 className="font-serif text-2xl font-semibold text-ink">
        {isEdit ? "Edit pickle" : "Upload new pickle"}
      </h3>

      {/* Image */}
      <div>
        <Label>Image</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-deep/40">
            {imageUrl ? (
              <Image src={imageUrl} alt="preview" fill unoptimized className="object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-xs text-ink2">No image</span>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload to S3"}
            </Button>
            <Input
              className="mt-2"
              placeholder="…or paste an image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input name="name" defaultValue={product?.name} placeholder="Garlic Pickle" required />
        </div>
        <div>
          <Label>Assamese name</Label>
          <Input name="assameseName" defaultValue={product?.assameseName} placeholder="নহৰু আচাৰ" required />
        </div>
        <div>
          <Label>Price ₹</Label>
          <Input name="price" type="number" defaultValue={product?.price} placeholder="249" required />
        </div>
        <div>
          <Label>Weight</Label>
          <Input name="weight" defaultValue={product?.weight} placeholder="250g" required />
        </div>
        <div>
          <Label>Spice level</Label>
          <Select name="spiceLevel" defaultValue={product?.spiceLevel ?? "MEDIUM"}>
            {SPICE_LEVELS.map((s) => (
              <option key={s} value={s}>
                {SPICE_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Stock</Label>
          <Input name="stock" type="number" defaultValue={product?.stock ?? 0} placeholder="40" required />
        </div>
        <div className="sm:col-span-2">
          <Label>Tone color (optional hex)</Label>
          <Input name="toneColor" defaultValue={product?.toneColor} placeholder="#b5482a" />
        </div>
      </div>

      <div>
        <Label>Short description</Label>
        <Textarea name="description" defaultValue={product?.description} required />
      </div>
      <div>
        <Label>Long description</Label>
        <Textarea name="longDescription" defaultValue={product?.longDescription} required />
      </div>

      <FieldError>{error}</FieldError>

      <Button type="submit" disabled={pending || uploading}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Publish pickle"}
      </Button>
    </form>
  );
}
