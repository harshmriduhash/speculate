import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { TEMPLATES } from "@/config/templates";

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");

    if (!signature || expected !== signature) {
      console.warn("Invalid Razorpay webhook signature");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const payload = JSON.parse(raw);
    const event = payload.event;

    // Handle payment captured event
    if (event === "payment.captured" || event === "payment.authorized") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        // Mark our payment record as COMPLETED
        const p = await prisma.payment.findFirst({ where: { OR: [{ stripeSessionId: orderId }, { razorpayOrderId: orderId }] } });
        if (p) {
          await prisma.payment.update({ where: { id: p.id }, data: { status: "COMPLETED", creditAmount: Math.floor(paymentEntity.amount / 100), razorpayOrderId: orderId } });
        }
      }
    }

    // Handle subscription events
    if (event && event.startsWith('subscription.')) {
      const subEntity = payload.payload?.subscription?.entity;
      if (subEntity) {
        const razorpayId = subEntity.id;
        const status = subEntity.status;
        // Update our subscription record if it exists
        const dbSub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: razorpayId } });
        if (dbSub) {
          await prisma.subscription.update({ where: { id: dbSub.id }, data: { status: status } });
        }
      }
    }

    // Handle payment failed for subscription charges
    if (event === 'payment.failed' || event === 'invoice.payment_failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const p = await prisma.payment.findFirst({ where: { stripeSessionId: orderId } });
        if (p) {
          await prisma.payment.update({ where: { id: p.id }, data: { status: 'FAILED' } });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
