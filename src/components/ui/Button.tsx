import { cn } from "@/lib/utils";
import Link from "next/link";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

const variants: Record<Variant, string> = {
  primary: "bg-terra text-ink hover:bg-terra-d shadow-md shadow-black/30",
  secondary: "bg-cream2 text-ink border border-line hover:border-terra",
  ghost: "text-ink2 hover:text-ink",
  success: "bg-green text-deep hover:brightness-110 shadow-md shadow-black/30",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Show a round spinner and disable the button while an action is in flight. */
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
