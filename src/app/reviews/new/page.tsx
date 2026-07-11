import { requireUser } from "@/lib/auth-guards";
import { ReviewSubmitForm } from "@/components/reviews/ReviewSubmitForm";

export const metadata = { title: "Write a review · Kerumoni" };

export default async function NewReviewPage() {
  const session = await requireUser("/reviews/new");

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mustard">Your voice</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold text-ink">Write a review</h1>
      <p className="mt-2 text-ink2">
        Loved our pickles? Share a few words (and a photo, if you like) — it helps other families
        discover Kerumoni.
      </p>

      <div className="mt-8">
        <ReviewSubmitForm defaultName={session.user.name ?? ""} />
      </div>
    </div>
  );
}
