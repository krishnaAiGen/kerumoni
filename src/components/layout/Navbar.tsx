import Link from "next/link";
import { auth } from "@/lib/auth";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { CartBadge } from "./CartBadge";
import { ButtonLink } from "@/components/ui/Button";

export async function Navbar() {
  const session = await auth();
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
          {session?.user && (
            <Link href="/reviews/new" className="transition-colors hover:text-ink">
              Write a review
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="transition-colors hover:text-ink">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <CartBadge />

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
