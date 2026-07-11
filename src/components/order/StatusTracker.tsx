import { ORDER_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusTracker({ statusIndex }: { statusIndex: number }) {
  return (
    <div className="flex items-center">
      {ORDER_STATUSES.map((label, i) => {
        const done = i <= statusIndex;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                  done ? "bg-green text-deep" : "bg-line text-ink2",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={cn("mt-1.5 text-[11px]", done ? "text-ink" : "text-ink2")}>
                {label}
              </span>
            </div>
            {i < ORDER_STATUSES.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-0.5 flex-1 -translate-y-2.5 rounded",
                  i < statusIndex ? "bg-green" : "bg-line",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
