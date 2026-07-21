import "server-only";

type OrderForNotify = {
  id: string;
  customerName: string;
  city: string;
  total: number;
  paymentMethod: string;
  items: { name: string; qty: number }[];
};

const TIMEOUT_MS = 8000;

/**
 * Send a WhatsApp order alert to the shop owner via the Twilio API.
 *
 * Best-effort by design: it never throws and no-ops when the Twilio env vars
 * aren't set, so a missing or failing notification can never block or fail
 * order finalization. Configure with:
 *   TWILIO_ACCOUNT_SID   – from the Twilio console
 *   TWILIO_AUTH_TOKEN    – from the Twilio console
 *   TWILIO_WHATSAPP_FROM – e.g. "whatsapp:+14155238886" (sandbox or your sender)
 *   OWNER_WHATSAPP_TO    – your number, e.g. "whatsapp:+919876543210"
 */
export async function notifyOwnerOfOrder(order: OrderForNotify): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.OWNER_WHATSAPP_TO;

  if (!sid || !token || !from || !to) {
    console.warn("[notify] Twilio WhatsApp not configured — skipping order alert.");
    return;
  }

  const items = order.items.map((i) => `${i.qty}× ${i.name}`).join(", ");
  const body =
    `🛍️ New order ${order.id}\n` +
    `₹${order.total} · ${order.paymentMethod}\n` +
    `${order.customerName} — ${order.city}\n` +
    `${items}`;

  const params = new URLSearchParams({ From: from, To: to, Body: body });
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[notify] Twilio responded ${res.status}: ${text}`);
    }
  } catch (err) {
    console.error("[notify] Failed to send WhatsApp order alert:", err);
  } finally {
    clearTimeout(timer);
  }
}
