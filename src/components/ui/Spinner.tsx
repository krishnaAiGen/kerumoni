import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Round loading spinner — lucide-react's Loader2 notched circle, spun with the
 * `animate-spin` utility. Sizes to the current font (1em) by default so it sits
 * inline with button text; pass a className for a fixed size/color.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn("h-[1em] w-[1em] shrink-0 animate-spin", className)}
    />
  );
}
