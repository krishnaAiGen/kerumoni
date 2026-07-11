import { cn } from "@/lib/utils";
import { formatMoney, formatMoneyExact } from "@/lib/utils";

/**
 * Shows the selling price, with the original MRP struck through and an "% OFF"
 * badge when a discount applies.
 */
export function PriceTag({
  price,
  originalPrice,
  discountPercent,
  className,
  size = "md",
}: {
  price: number;
  originalPrice: number;
  discountPercent: number;
  className?: string;
  size?: "md" | "lg";
}) {
  const hasDiscount = discountPercent > 0 && originalPrice > price;

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "font-serif font-semibold text-mustard",
          size === "lg" ? "text-3xl" : "text-xl",
        )}
      >
        {formatMoney(price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-ink2 line-through">{formatMoneyExact(originalPrice)}</span>
          <span className="rounded-full bg-green/20 px-2 py-0.5 text-xs font-semibold text-green">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </span>
  );
}
