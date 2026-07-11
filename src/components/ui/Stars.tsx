import { cn } from "@/lib/utils";

/** Static star display for a rating value. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={cn("tracking-tight text-mustard", className)} aria-label={`${rating} stars`}>
      {"★★★★★".slice(0, full)}
      <span className="text-line">{"★★★★★".slice(full)}</span>
    </span>
  );
}
