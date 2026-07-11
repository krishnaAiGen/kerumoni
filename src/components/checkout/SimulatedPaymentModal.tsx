"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";

export function SimulatedPaymentModal({
  amount,
  method,
  pending,
  onConfirm,
  onClose,
}: {
  amount: number;
  method: PaymentMethod;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const m = PAYMENT_METHODS.find((x) => x.value === method);
  return (
    <Modal open onClose={onClose}>
      <div className="text-center">
        <p className="text-sm text-ink2">Paying to Kerumoni</p>
        <p className="mt-1 font-serif text-4xl font-semibold text-ink">{formatMoney(amount)}</p>
      </div>
      <div className="mt-5 rounded-xl border border-line bg-deep/40 p-4 text-center">
        <p className="font-semibold text-ink">{m?.label}</p>
        <p className="text-xs text-ink2">{m?.sub}</p>
      </div>
      <Button variant="success" className="mt-5 w-full" onClick={onConfirm} loading={pending}>
        {pending ? "Processing…" : `Pay ${formatMoney(amount)}`}
      </Button>
      <p className="mt-3 text-center text-xs text-ink2">
        This is a simulated payment (Razorpay keys not configured).
      </p>
    </Modal>
  );
}
