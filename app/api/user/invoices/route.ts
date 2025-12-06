import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ invoices: [] });
    }

    const userId = (session.user as any).id;

    // Fetch all payments and subscriptions for the user
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Map to invoice format
    const invoices = payments.map((p) => ({
      id: p.id,
      type: 'payment',
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      date: p.createdAt,
      orderId: p.razorpayOrderId || p.stripeSessionId,
    }));

    const subscriptionInvoices = subscriptions.map((s) => ({
      id: s.id,
      type: 'subscription',
      amount: 0, // subscription amounts vary; fetch from Razorpay if needed
      currency: 'INR',
      status: s.status,
      date: s.createdAt,
      subscriptionId: s.razorpaySubscriptionId || s.stripeSubscriptionId,
      nextBillDate: s.currentPeriodEnd,
    }));

    return NextResponse.json({ invoices: [...invoices, ...subscriptionInvoices] });
  } catch (err) {
    console.error('invoices error', err);
    return NextResponse.json({ invoices: [], error: 'server_error' }, { status: 500 });
  }
}
