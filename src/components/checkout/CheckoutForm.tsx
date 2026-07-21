"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCheckoutOrder, finalizeSimulatedPayment } from "@/actions/order.actions";
import { estimateShipping } from "@/actions/shipping.actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { SimulatedPaymentModal } from "./SimulatedPaymentModal";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants";
import { cn, formatMoney } from "@/lib/utils";
import { loadRazorpay, type RazorpayResponse, type RazorpayFailure } from "@/lib/load-razorpay";

export function CheckoutForm({ subtotal }: { subtotal: number }) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sim, setSim] = useState<{ orderId: string; amount: number } | null>(null);

  // Distance-based shipping, quoted from the delivery city.
  const [city, setCity] = useState("");
  const [shipping, setShipping] = useState<number | null>(null);
  const [shipNote, setShipNote] = useState<string | undefined>();
  const [shipLoading, setShipLoading] = useState(false);

  const total = shipping !== null ? subtotal + shipping : null;

  async function quoteCity(value: string) {
    const c = value.trim();
    if (c.length < 2) {
      setShipping(null);
      setShipNote(undefined);
      return;
    }
    setShipLoading(true);
    setShipNote("Calculating shipping…");
    setShipping(null);
    const res = await estimateShipping(c);
    setShipLoading(false);
    if (!res.ok) {
      setShipping(null);
      setShipNote(res.error);
      return;
    }
    setShipping(res.shipping);
    setShipNote(
      `Speed Post to ${c} · ${res.local ? "within city" : `~${res.distanceKm} km`} · ${res.band}`,
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const input = {
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      pincode: String(form.get("pincode") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      paymentMethod: method,
    };

    startTransition(async () => {
      const res = await createCheckoutOrder(input);
      if (!res.ok) {
        if (res.requiresAuth) {
          router.push("/login?next=/checkout");
          return;
        }
        setError(res.error ?? "Could not start payment.");
        return;
      }

      if (res.mode === "simulated") {
        setSim({ orderId: res.orderId, amount: res.amount });
        return;
      }

      // Real Razorpay checkout
      const ok = await loadRazorpay();
      if (!ok) {
        setError("Could not load the payment gateway.");
        return;
      }

      const rzp = new window.Razorpay({
        key: res.keyId,
        amount: res.amount * 100,
        currency: "INR",
        name: "Kerumoni",
        description: `Order ${res.orderId}`,
        order_id: res.razorpayOrderId,
        prefill: res.prefill,
        theme: { color: "#b5482a" },
        modal: {
          // User closed the Razorpay modal without paying.
          ondismiss: () => setError("Payment cancelled — you can try again."),
        },
        handler: async (r: RazorpayResponse) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: res.orderId,
              razorpayOrderId: r.razorpay_order_id,
              razorpayPaymentId: r.razorpay_payment_id,
              signature: r.razorpay_signature,
            }),
          }).then((x) => x.json());

          if (verifyRes.ok) {
            router.push(`/orders/${res.orderId}`);
          } else {
            setError(verifyRes.error ?? "Payment verification failed. You were not charged.");
          }
        },
      });

      // Payment attempted but failed (card declined, etc.).
      rzp.on("payment.failed", (resp: RazorpayFailure) => {
        setError(resp.error?.description ?? "Payment failed. Please try another method.");
      });

      rzp.open();
    });
  }

  function confirmSimulated() {
    if (!sim) return;
    startTransition(async () => {
      const res = await finalizeSimulatedPayment(sim.orderId);
      if (res.ok) {
        router.push(`/orders/${sim.orderId}`);
      } else {
        setError(res.error ?? "Payment failed.");
        setSim(null);
      }
    });
  }

  return (
    <>
      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <h2 className="font-serif text-2xl font-semibold text-ink">Delivery details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Full name</Label>
              <Input name="customerName" placeholder="Ritu Kalita" required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" placeholder="9876543210" required />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input name="pincode" placeholder="785001" required />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input name="address" placeholder="House no, street, area" required />
            </div>
            <div className="sm:col-span-2">
              <Label>City / Town</Label>
              <Input
                name="city"
                placeholder="Jorhat"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onBlur={() => quoteCity(city)}
                required
              />
              <p className="mt-1 text-xs text-ink2">
                Shipping is calculated from Guwahati to your city.
              </p>
            </div>
          </div>

          <div>
            <Label>Payment method</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    method === m.value
                      ? "border-terra bg-terra/10"
                      : "border-line hover:border-terra/60",
                  )}
                >
                  <div className="font-semibold text-ink">{m.label}</div>
                  <div className="text-xs text-ink2">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <FieldError>{error}</FieldError>
        </div>

        <div className="h-fit">
          <OrderSummary
            subtotal={subtotal}
            shipping={shipLoading ? null : shipping}
            total={total}
            shippingNote={shipNote}
          >
            <Button type="submit" className="mt-5 w-full" loading={pending}>
              {pending ? "Processing…" : `Pay ${formatMoney(total ?? subtotal)} securely`}
            </Button>
            <p className="mt-3 text-center text-xs text-ink2">🔒 Secured payment</p>
          </OrderSummary>
        </div>
      </form>

      {sim && (
        <SimulatedPaymentModal
          amount={sim.amount}
          method={method}
          pending={pending}
          onConfirm={confirmSimulated}
          onClose={() => setSim(null)}
        />
      )}
    </>
  );
}
