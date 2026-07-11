"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { advanceOrderStatus } from "@/actions/order.actions";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUSES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

export function AdvanceStatusButton({
  orderId,
  statusIndex,
}: {
  orderId: string;
  statusIndex: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  if (statusIndex >= ORDER_STATUSES.length - 1) {
    return <span className="text-sm text-green">Delivered</span>;
  }

  const nextLabel = ORDER_STATUSES[statusIndex + 1];

  return (
    <Button
      size="sm"
      variant="secondary"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await advanceOrderStatus(orderId);
          if (!res.ok) toast(res.error ?? "Failed");
          router.refresh();
        })
      }
    >
      {pending ? "Updating…" : `Mark ${nextLabel}`}
    </Button>
  );
}
