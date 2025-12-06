import { NextResponse } from "next/server";
import { createOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, receipt } = body;

    if (!amount) return NextResponse.json({ error: "amount_required" }, { status: 400 });

    // Razorpay expects amount in smallest currency unit (paise for INR)
    const order = await createOrder(amount, currency || "INR", receipt);

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "server_error" }, { status: 500 });
  }
}
