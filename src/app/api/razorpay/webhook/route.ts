import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { finalizePaidOrder } from "@/lib/finalize-order";

/**
 * Server-to-server payment confirmation from Razorpay. Independent of the
 * browser, so an order is marked PAID even if the customer closes the tab
 * before the client-side /api/razorpay/verify call runs.
 *
 * Register the URL in Dashboard → Settings → Webhooks with the same secret as
 * RAZORPAY_WEBHOOK_SECRET, subscribed to `payment.captured` (and optionally
 * `payment.failed`). Reuses the idempotent finalizePaidOrder(), so it's safe if
 * both this and /api/razorpay/verify fire for the same payment.
 */
type RzpWebhookEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
  };
};

export async function POST(req: Request) {
  // Signature is computed over the raw body — read it as text, not JSON.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  let event: RzpWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RzpWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const payment = event.payload?.payment?.entity;

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const razorpayOrderId = payment?.order_id ?? event.payload?.order?.entity?.id;
      const razorpayPaymentId = payment?.id;
      if (razorpayOrderId && razorpayPaymentId) {
        const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
        if (order) await finalizePaidOrder(order.id, razorpayPaymentId);
      }
    } else if (event.event === "payment.failed") {
      const razorpayOrderId = payment?.order_id;
      if (razorpayOrderId) {
        // Only fail a still-pending order — never override an already-PAID one.
        await prisma.order.updateMany({
          where: { razorpayOrderId, paymentStatus: "CREATED" },
          data: { paymentStatus: "FAILED" },
        });
      }
    }
  } catch (err) {
    console.error("[razorpay webhook] handler error", err);
    // 500 → Razorpay retries later.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // 200 acknowledges receipt (including ignored event types) so Razorpay stops retrying.
  return NextResponse.json({ ok: true });
}
