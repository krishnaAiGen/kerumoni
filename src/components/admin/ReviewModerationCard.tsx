"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishTestimonial, rejectTestimonial } from "@/actions/testimonial.actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate, initials } from "@/lib/utils";

export function ReviewModerationCard({
  review,
}: {
  review: {
    id: string;
    userName: string;
    text: string;
    imageUrl: string | null;
    createdAt: string | Date;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function act(kind: "publish" | "reject") {
    startTransition(async () => {
      const res =
        kind === "publish"
          ? await publishTestimonial(review.id)
          : await rejectTestimonial(review.id);
      if (!res.ok) {
        toast(res.error ?? "Action failed");
        return;
      }
      toast(kind === "publish" ? "Review published" : "Review rejected");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-paper/70 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-mustard text-sm font-bold text-deep">
          {initials(review.userName)}
        </span>
        <div>
          <p className="font-medium text-ink">{review.userName}</p>
          <p className="text-xs text-ink2">{formatDate(review.createdAt)}</p>
        </div>
      </div>

      <p className="mt-3 text-ink2">{review.text}</p>

      {review.imageUrl && (
        <div className="relative mt-3 h-40 w-full overflow-hidden rounded-xl border border-line">
          <Image src={review.imageUrl} alt="review photo" fill unoptimized className="object-cover" />
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="success" loading={pending} onClick={() => act("publish")}>
          Publish
        </Button>
        <Button size="sm" variant="secondary" loading={pending} onClick={() => act("reject")}>
          Reject
        </Button>
      </div>
    </div>
  );
}
