import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  // It's okay for dev mode; callers should handle missing creds.
  console.warn("RAZORPAY keys not found in env. Razorpay integration will be disabled.");
}

export const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export async function createOrder(amountInSmallestUnit: number, currency = "INR", receipt?: string) {
  const rp = getRazorpayInstance();
  if (!rp) throw new Error("Razorpay not configured");

  const order = await rp.orders.create({
    amount: amountInSmallestUnit,
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1,
  });

  return order;
}
