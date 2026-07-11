import { getPendingTestimonials, getPublishedTestimonials } from "@/data/testimonials";
import { ReviewModerationCard } from "@/components/admin/ReviewModerationCard";

export default async function AdminReviewsPage() {
  const [pending, published] = await Promise.all([
    getPendingTestimonials(),
    getPublishedTestimonials(50),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">
          Pending approval {pending.length > 0 && <span className="text-ink2">({pending.length})</span>}
        </h2>
        {pending.length === 0 ? (
          <p className="text-ink2">No reviews waiting for approval.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((r) => (
              <ReviewModerationCard
                key={r.id}
                review={{
                  id: r.id,
                  userName: r.userName,
                  text: r.text,
                  imageUrl: r.imageUrl,
                  createdAt: r.createdAt,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">
          Published {published.length > 0 && <span className="text-ink2">({published.length})</span>}
        </h2>
        {published.length === 0 ? (
          <p className="text-ink2">No published reviews yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {published.map((r) => (
              <ReviewModerationCard
                key={r.id}
                review={{
                  id: r.id,
                  userName: r.userName,
                  text: r.text,
                  imageUrl: r.imageUrl,
                  createdAt: r.createdAt,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
