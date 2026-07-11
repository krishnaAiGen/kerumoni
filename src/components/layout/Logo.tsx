import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-terra text-lg font-bold text-ink">
        {BRAND.logo}
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-serif text-lg font-semibold text-ink">{BRAND.name}</span>
          <span className="block text-[10px] uppercase tracking-[0.15em] text-ink2">
            {BRAND.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
