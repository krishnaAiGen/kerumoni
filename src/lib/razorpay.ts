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

/** Create a Razorpay order. Amount is in paise (rupees * 100). */
export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  return razorpay().orders.create({
    amount: amountRupees * 100,
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
