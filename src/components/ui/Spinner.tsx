import { cn } from "@/lib/utils";

/**
 * Round loading spinner. Black rotating head over a light track so it's clearly
 * visible on any button. The animation is applied inline so it always runs
 * regardless of CSS-utility ordering/purging.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{ animation: "kerumoni-spin 0.6s linear infinite" }}
      className={cn(
        "inline-block h-4 w-4 shrink-0 rounded-full border-[3px] border-white/60 border-t-black",
        className,
      )}
    />
  );
}
