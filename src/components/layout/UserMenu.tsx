"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { initials } from "@/lib/utils";

export function UserMenu({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="grid h-9 w-9 place-items-center rounded-full bg-mustard text-sm font-bold text-deep"
        aria-label="Account menu"
      >
        {initials(name)}
      </button>
      {open && (
        <div className="animate-pop-in absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-xl">
          <div className="border-b border-line px-4 py-2 text-xs text-ink2">
            Hi, {name.split(" ")[0]}
          </div>
          <Link href="/account" className="block px-4 py-2 text-sm text-ink hover:bg-cream2">
            My orders
          </Link>
          {isAdmin && (
            <Link href="/admin" className="block px-4 py-2 text-sm text-ink hover:bg-cream2">
              Admin dashboard
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2 text-left text-sm text-terra-d hover:bg-cream2"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
