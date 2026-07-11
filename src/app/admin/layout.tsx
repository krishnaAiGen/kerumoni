import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminKpis } from "@/data/metrics";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Admin · Kerumoni" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const kpis = await getAdminKpis();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold text-ink">Admin dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Revenue" value={formatMoney(kpis.revenue)} />
        <Kpi label="Orders" value={String(kpis.orders)} />
        <Kpi label="To ship" value={String(kpis.toShip)} />
        <Kpi label="Products" value={String(kpis.products)} />
      </div>

      <nav className="mt-8 flex gap-2 border-b border-line">
        <Tab href="/admin/orders" label="Orders" />
        <Tab href="/admin/products" label="Products" />
        <Tab href="/admin/payments" label="Payments" />
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper/70 p-5">
      <div className="text-xs uppercase tracking-wide text-ink2">{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function Tab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink2 transition-colors hover:border-terra hover:text-ink"
    >
      {label}
    </Link>
  );
}
