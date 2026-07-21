"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MIN_ORDER_QTY } from "@/lib/constants";

export function CheckoutButton({ count }: { count: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [message, setMessage] = useState<string | null>(null);

  const short = MIN_ORDER_QTY - count;
  const belowMin = count < MIN_ORDER_QTY;

  function onClick() {
    if (belowMin) {
      const msg = `Minimum order is ${MIN_ORDER_QTY} jars. Please add ${short} more.`;
      setMessage(msg);
      toast(msg);
      return;
    }
    router.push("/checkout");
  }

  return (
    <>
      <Button className="mt-5 w-full" onClick={onClick}>
        Proceed to checkout
      </Button>
      {message && <p className="mt-2 text-center text-sm text-terra-d">{message}</p>}
      {!message && belowMin && (
        <p className="mt-2 text-center text-xs text-ink2">
          Minimum order is {MIN_ORDER_QTY} jars.
        </p>
      )}
    </>
  );
}
