import { getPaymentKpis } from "@/data/metrics";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const { totalCollected, count, avg, transactions } = await getPaymentKpis();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Total collected" value={formatMoney(totalCollected)} />
        <Card label="Transactions" value={String(count)} />
        <Card label="Avg order value" value={formatMoney(avg)} />
      </div>

      {transactions.length === 0 ? (
        <p className="text-ink2">No payments yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-paper/70 text-ink2">
              <tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Method</Th>
                <Th>Date</Th>
                <Th>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-line">
                  <Td className="font-medium text-ink">{t.id}</Td>
                  <Td className="text-ink">{t.customerName}</Td>
                  <Td className="text-ink2">{t.paymentMethod}</Td>
                  <Td className="text-ink2">{formatDate(t.createdAt)}</Td>
                  <Td className="text-ink">{formatMoney(t.total)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper/70 p-5">
      <div className="text-xs uppercase tracking-wide text-ink2">{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
