"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-28 text-center">
      <h1 className="font-serif text-3xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 text-ink2">
        We hit a snag loading this page. Please try again in a moment.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
