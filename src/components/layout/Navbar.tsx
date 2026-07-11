import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCartCount } from "@/data/cart";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { ButtonLink } from "@/components/ui/Button";

export async function Navbar() {
  const session = await auth();
  const count = await getCartCount();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-7 text-sm font-medium text-ink2 md:flex">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          {isAdmin && (
            <Link href="/admin" className="transition-colors hover:text-ink">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-terra"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-terra px-1 text-[11px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>

          {session?.user ? (
            <UserMenu name={session.user.name ?? "Guest"} isAdmin={isAdmin} />
          ) : (
            <ButtonLink href="/login" size="sm">
              Sign in
            </ButtonLink>
          )}
        </div>
      </nav>
    </header>
  );
}
