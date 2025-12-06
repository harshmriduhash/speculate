import { NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { TEMPLATES } from "@/config/templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const rp = getRazorpayInstance();
    if (!rp) return NextResponse.json({ error: 'razorpay_not_configured' }, { status: 500 });

    // Fetch order details to read receipt/notes
    const order = await rp.orders.fetch(razorpay_order_id);

    // Verify that payment is captured
    const payment = await rp.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status !== 'captured') {
      return NextResponse.json({ error: 'payment_not_captured' }, { status: 400 });
    }

    // Mark our payment DB record as completed
    const dbPayment = await prisma.payment.findFirst({ where: { OR: [{ razorpayOrderId: razorpay_order_id }, { stripeSessionId: razorpay_order_id }] } });
    if (dbPayment) {
      await prisma.payment.update({ where: { id: dbPayment.id }, data: { status: 'COMPLETED', creditAmount: Math.floor(Number(payment.amount) / 100), razorpayOrderId: razorpay_order_id } });
    }

    // If order.receipt encodes template, e.g., 'template:customer-survey', create the template in user's project
    const receipt = order.receipt as string | undefined;
    if (receipt && receipt.startsWith('template:')) {
      const templateId = receipt.split(':')[1];
      const tpl = TEMPLATES.find((t) => t.id === templateId);
      if (tpl) {
        const session = await getServerSession(authOptions);
        const userId = session?.user ? (session.user as any).id : null;
        if (userId) {
          // find or create a 'Purchased Templates' project for this user
          let project = await prisma.project.findFirst({ where: { userId, name: 'Purchased Templates' } });
          if (!project) {
            project = await prisma.project.create({ data: { name: 'Purchased Templates', userId, description: 'Templates purchased from marketplace' } });
          }

          // create ChartInstance
          await prisma.chartInstance.create({ data: { name: tpl.name, content: JSON.stringify(tpl.content), userId, projectId: project.id, isPublished: false } });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
