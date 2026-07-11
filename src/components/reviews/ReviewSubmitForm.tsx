"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { submitTestimonial } from "@/actions/testimonial.actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export function ReviewSubmitForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitTestimonial(formData);
      if (res.requiresAuth) {
        router.push("/login?next=/reviews/new");
        return;
      }
      if (!res.ok) {
        setError(res.error ?? "Could not submit your review.");
        return;
      }
      toast(res.note ?? "Thanks! Your review is awaiting approval.");
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-line bg-paper/70 p-6">
      <div>
        <Label>Your name *</Label>
        <Input name="userName" defaultValue={defaultName} placeholder="Priya Sharma" required />
      </div>

      <div>
        <Label>Your review *</Label>
        <Textarea
          name="text"
          placeholder="Tell others what you loved about our pickles…"
          required
        />
      </div>

      <div>
        <Label>Photo (optional)</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-deep/40">
            {preview ? (
              <Image src={preview} alt="preview" fill unoptimized className="object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-xs text-ink2">No photo</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            Choose photo
          </Button>
        </div>
      </div>

      <FieldError>{error}</FieldError>

      <Button type="submit" loading={pending}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
      <p className="text-xs text-ink2">Your review will appear on the site once approved.</p>
    </form>
  );
}
