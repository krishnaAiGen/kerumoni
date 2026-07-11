import { SPICE_LABELS, type SpiceLevel } from "@/lib/constants";
import { cn } from "@/lib/utils";

const styles: Record<SpiceLevel, string> = {
  MILD: "bg-green/25 text-green",
  MEDIUM: "bg-mustard/25 text-mustard",
  HOT: "bg-terra/25 text-terra-d",
  FIERY: "bg-terra/30 text-terra-d",
};

export function SpiceBadge({ level }: { level: SpiceLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[level],
      )}
    >
      {SPICE_LABELS[level]}
    </span>
  );
}
