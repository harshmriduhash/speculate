import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

// POST /api/subscriptions/cancel - cancel user's subscription
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    // Find and update subscription to mark for cancellation
    const sub = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!sub) {
      return NextResponse.json({ error: 'subscription_not_found' }, { status: 404 });
    }

    // Mark for cancellation at period end
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('cancel-subscription error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
