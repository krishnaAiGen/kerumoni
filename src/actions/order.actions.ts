"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getCart } from "@/data/cart";
import { deliverySchema, type DeliveryInput } from "@/lib/validators/checkout";
import { generateOrderId } from "@/lib/ids";
import { MIN_ORDER_QTY } from "@/lib/constants";
import { quoteShipping } from "@/lib/geocode";
import { isRazorpayConfigured, createRazorpayOrder } from "@/lib/razorpay";
import { finalizePaidOrder } from "@/lib/finalize-order";

export type CheckoutResult =
  | {
      ok: true;
      mode: "razorpay" | "simulated";
      orderId: string;
      razorpayOrderId: string;
      amount: number; // rupees
      keyId?: string;
      prefill: { name: string; email: string; contact: string };
    }
  | { ok: false; error?: string; requiresAuth?: boolean };

/**
 * Create a pending order from the current cart, plus a Razorpay order (or a
 * simulated one when Razorpay keys are absent). Totals are recomputed
 * server-side — never trusted from the client.
 */
export async function createCheckoutOrder(input: DeliveryInput): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, requiresAuth: true };

  const parsed = deliverySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }
  const d = parsed.data;

  const cart = await getCart();
  if (cart.lines.length === 0) return { ok: false, error: "Your cart is empty." };
  if (cart.count < MIN_ORDER_QTY) {
    return {
      ok: false,
      error: `Minimum order is ${MIN_ORDER_QTY} jars. Please add ${MIN_ORDER_QTY - cart.count} more.`,
    };
  }

  // Shipping is recomputed server-side from the delivery city (never trusted from the client).
  const quote = await quoteShipping(d.city, cart.weightGrams);
  if (!quote) {
    return { ok: false, error: "We couldn't verify your city for shipping — please check the spelling." };
  }
  const total = cart.subtotal + quote.shipping;

  const orderId = generateOrderId();
  const configured = isRazorpayConfigured();

  let razorpayOrderId: string;
  if (configured) {
    try {
      const rp = await createRazorpayOrder(total, orderId);
      razorpayOrderId = rp.id;
    } catch (err) {
      console.error("Razorpay order creation failed:", err);
      return { ok: false, error: "Could not start payment. Please try again." };
    }
  } else {
    razorpayOrderId = `sim_${orderId}`;
  }

  await prisma.order.create({
    data: {
      id: orderId,
      userId: session.user.id,
      customerName: d.customerName,
      phone: d.phone,
      address: d.address,
      city: d.city,
      pincode: d.pincode,
      paymentMethod: d.paymentMethod,
      razorpayOrderId,
      paymentStatus: "CREATED",
      total,
      items: {
        create: cart.lines.map((l) => ({
          productId: l.productId,
          name: l.name,
          qty: l.qty,
          price: l.price,
        })),
      },
    },
  });

  return {
    ok: true,
    mode: configured ? "razorpay" : "simulated",
    orderId,
    razorpayOrderId,
    amount: total,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    prefill: {
      name: d.customerName,
      email: session.user.email ?? "",
      contact: d.phone,
    },
  };
}

/**
 * Finalize a simulated payment. Only permitted when Razorpay is NOT configured
 * (so real deployments always go through signature verification).
 */
export async function finalizeSimulatedPayment(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  if (isRazorpayConfigured()) {
    return { ok: false, error: "Use the real payment flow." };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    return { ok: false, error: "Order not found." };
  }

  const res = await finalizePaidOrder(orderId, `sim_pay_${orderId}`);
  if (res.ok) {
    revalidatePath("/account");
    revalidatePath("/", "layout");
  }
  return res;
}

/** Admin: advance an order to the next fulfilment stage. */
export async function advanceOrderStatus(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Not authorized." };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Order not found." };

  const next = Math.min(order.statusIndex + 1, 3);
  await prisma.order.update({ where: { id: orderId }, data: { statusIndex: next } });

  revalidatePath("/admin/orders");
  revalidatePath("/account");
  return { ok: true };
}
