import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isSubscribed: false });
    }

    const userId = (session.user as any).id;

    // Check for an active subscription or recent successful payments
    const activeSubscription = await prisma.subscription.findFirst({ where: { userId, status: "active" } });
    if (activeSubscription) {
      return NextResponse.json({ isSubscribed: true, tier: activeSubscription.stripePriceId || null, subscription: activeSubscription });
    }

    // fallback: check for completed one-time payments that grant Pro for now
    const recentPayment = await prisma.payment.findFirst({ where: { userId, status: "COMPLETED" }, orderBy: { createdAt: 'desc' } });
    if (recentPayment) {
      return NextResponse.json({ isSubscribed: true, tier: null, lastPayment: recentPayment });
    }

    return NextResponse.json({ isSubscribed: false });
  } catch (err) {
    console.error('subscription-status error', err);
    return NextResponse.json({ isSubscribed: false, error: 'server_error' }, { status: 500 });
  }
}
