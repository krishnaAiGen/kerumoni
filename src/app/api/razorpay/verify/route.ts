import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifySignature } from "@/lib/razorpay";
import { finalizePaidOrder } from "@/lib/finalize-order";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  const razorpayOrderId = body?.razorpayOrderId as string | undefined;
  const razorpayPaymentId = body?.razorpayPaymentId as string | undefined;
  const signature = body?.signature as string | undefined;

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !signature) {
    return NextResponse.json({ ok: false, error: "Missing fields." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }
  if (order.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ ok: false, error: "Order mismatch." }, { status: 400 });
  }

  if (!verifySignature(razorpayOrderId, razorpayPaymentId, signature)) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "FAILED" },
    });
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  const res = await finalizePaidOrder(orderId, razorpayPaymentId);
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, orderId });
}
