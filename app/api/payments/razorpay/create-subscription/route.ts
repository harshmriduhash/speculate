import { NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });

    const body = await req.json();
    const { tier } = body;
    // Map tier to plan details
    const planDetails = {
      pro: { period: 'monthly', interval: 1, amount: 2000, currency: 'INR', name: 'Pro Monthly' },
      team: { period: 'monthly', interval: 1, amount: 5000, currency: 'INR', name: 'Team Monthly' },
    } as any;

    const details = planDetails[tier];
    if (!details) return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });

    const rp = getRazorpayInstance();
    if (!rp) return NextResponse.json({ error: 'razorpay_not_configured' }, { status: 500 });

    // Create plan (Razorpay concept: plan -> subscription). For idempotency, search by plan name in DB
    let planId: string | null = null;
    // Check if plan already exists in DB
    const existing = await prisma.subscription.findFirst({ where: { OR: [{ stripePriceId: details.name }, { razorpayPlanId: details.name }] } });
    if (existing && (existing.stripeSubscriptionId || existing.razorpaySubscriptionId)) {
      planId = existing.stripePriceId || existing.razorpayPlanId || null;
    }

    // Create a subscription for the customer
    // For Razorpay, we typically create a plan first and then a subscription referencing plan_id. For MVP we'll use subscriptions.create with plan details inline when possible.
    const subscriptionPayload: any = {
      plan_id: undefined,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,
      // For more advanced flows, create plan separately
    };

    // Create subscription using the plan amount via items (if SDK supports). We attempt to create a subscription without a pre-existing plan by creating a plan first.
    const plan = await rp.plans.create({
      period: details.period,
      interval: details.interval,
      item: { name: details.name, amount: details.amount, currency: details.currency },
    });

    const subscription = await rp.subscriptions.create({ plan_id: plan.id, total_count: 12, customer_notify: 1 });

    // Save subscription in DB
    await prisma.subscription.create({ data: {
      stripeSubscriptionId: undefined,
      stripePriceId: undefined,
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: details.name,
      status: subscription.status || 'created',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30*24*3600*1000),
      userId: (session.user as any).id,
    }});

    return NextResponse.json({ subscription });
  } catch (err) {
    console.error('create-subscription error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
