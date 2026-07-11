import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line/60 bg-deep/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Logo />
        <p className="text-sm text-ink2">
          Handmade in Assam · Shipped across India · © 2026
        </p>
      </div>
    </footer>
  );
}
