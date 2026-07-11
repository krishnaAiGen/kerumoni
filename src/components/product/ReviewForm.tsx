"use client";

import { useSession } from "next-auth/react";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Call-to-action shown under a product's reviews. Logged-out visitors are
 * invited to sign in and are routed to the review page after login.
 */
export function ReviewForm() {
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  return (
    <div className="rounded-2xl border border-line bg-paper/60 p-6 text-center">
      <h3 className="font-serif text-2xl font-semibold text-ink">
        {loggedIn ? "Enjoyed this pickle?" : "If you like our pickle, please rate us"}
      </h3>
      <p className="mt-2 text-ink2">
        {loggedIn
          ? "Share a few words (and a photo) — it helps other families discover us."
          : "Sign in to leave a review and a photo."}
      </p>
      <ButtonLink
        href={loggedIn ? "/reviews/new" : "/login?next=/reviews/new"}
        className="mt-4"
      >
        {loggedIn ? "Write a review" : "Sign in to review"}
      </ButtonLink>
    </div>
  );
}
