import "server-only";
import Razorpay from "razorpay";
import crypto from "crypto";

let _client: Razorpay | null = null;

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpay(): Razorpay {
  if (!_client) {
    _client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _client;
}

/** Create a Razorpay order. Amount (rupees) is converted to paise; min 100 paise. */
export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  const amountPaise = Math.round(amountRupees * 100);
  if (amountPaise < 100) {
    throw new Error("Order amount must be at least ₹1 (100 paise).");
  }
  return razorpay().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
  });
}

/** Verify the checkout signature returned by Razorpay Checkout. */
export function verifySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  // constant-time compare
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Verify a Razorpay webhook call: HMAC-SHA256 of the RAW request body using
 * RAZORPAY_WEBHOOK_SECRET, compared against the X-Razorpay-Signature header.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
