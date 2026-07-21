"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatus, deleteOrder } from "@/actions/order.actions";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUSES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

/**
 * Admin order controls: a status dropdown that can jump to any stage directly
 * (not just the next one), plus a delete action.
 */
export function OrderActions({ orderId, statusIndex }: { orderId: string; statusIndex: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function changeStatus(next: number) {
    if (next === statusIndex) return;
    startTransition(async () => {
      const res = await setOrderStatus(orderId, next);
      if (!res.ok) toast(res.error ?? "Failed to update status");
      router.refresh();
    });
  }

  function onDelete() {
    if (!window.confirm("Delete this order permanently? This can't be undone.")) return;
    startTransition(async () => {
      const res = await deleteOrder(orderId);
      if (!res.ok) {
        toast(res.error ?? "Failed to delete order");
        return;
      }
      toast("Order deleted");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Order status"
        value={statusIndex}
        onChange={(e) => changeStatus(Number(e.target.value))}
        disabled={pending}
        className="w-36 py-1.5 text-sm"
      >
        {ORDER_STATUSES.map((label, i) => (
          <option key={label} value={i}>
            {label}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        loading={pending}
        className="text-terra-d"
      >
        Delete
      </Button>
    </div>
  );
}
