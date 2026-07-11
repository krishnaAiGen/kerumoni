export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="h-4 w-24 rounded bg-line/60" />
      <div className="mt-3 h-12 w-64 rounded bg-line/40" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line bg-paper/50">
            <div className="aspect-square animate-pulse bg-line/30" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-2/3 rounded bg-line/40" />
              <div className="h-4 w-1/2 rounded bg-line/30" />
              <div className="h-9 w-full rounded bg-line/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
