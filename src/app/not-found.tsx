import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-28 text-center">
      <p className="font-serif text-6xl font-semibold text-terra-d">404</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-ink2">This jar rolled off the shelf. Let&apos;s get you back.</p>
      <ButtonLink href="/" className="mt-6">
        Back home
      </ButtonLink>
    </div>
  );
}
