import { NextResponse } from "next/server";
import { createOrder } from "@/lib/razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, receipt } = body;

    if (!amount) return NextResponse.json({ error: "amount_required" }, { status: 400 });

    // Razorpay expects amount in smallest currency unit (paise for INR)
    const order = await createOrder(amount, currency || "INR", receipt);

    // Create payment record in DB (status PENDING)
    try {
      const session = await getServerSession(authOptions);
      const userId = session?.user ? (session.user as any).id : null;

      await prisma.payment.create({
        data: {
          amount: Math.round(amount),
          currency: currency || "INR",
          status: "PENDING",
          stripeSessionId: order.id,
          razorpayOrderId: order.id,
          creditAmount: 0,
          userId: userId || undefined,
        },
      });
    } catch (err) {
      console.warn("Could not create payment record:", err);
    }

    return NextResponse.json({ order, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "server_error" }, { status: 500 });
  }
}
