"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { submitReview } from "@/actions/review.actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  if (status !== "authenticated") {
    return (
      <div className="rounded-2xl border border-line bg-paper/60 p-6 text-center">
        <p className="text-ink2">Sign in to rate and review this pickle.</p>
        <ButtonLink
          href={`/login?next=/products/${productId}`}
          size="sm"
          className="mt-3"
        >
          Sign in
        </ButtonLink>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitReview(productId, { rating, text });
      if (!res.ok) {
        toast(res.error ?? "Could not post review");
        return;
      }
      setText("");
      setRating(5);
      toast("Thanks for your review!");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-paper/60 p-6">
      <h3 className="font-serif text-2xl font-semibold text-ink">Rate &amp; review this pickle</h3>
      <div className="mt-3 flex gap-1 text-3xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={cn(
              "transition-colors",
              n <= rating ? "text-mustard" : "text-line hover:text-mustard/60",
            )}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tell others what you loved…"
        className="mt-4"
        required
      />
      <Button type="submit" className="mt-4" loading={pending}>
        {pending ? "Posting…" : "Post review"}
      </Button>
    </form>
  );
}
