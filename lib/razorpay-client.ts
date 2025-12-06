type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(order: RazorpayOrder, key: string, options?: { name?: string; description?: string }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error("Failed to load Razorpay script");

  return new Promise<void>((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: options?.name ?? "Speculate",
      description: options?.description ?? "Purchase",
      handler: async function (response: any) {
        // After checkout success, POST the payment details to server to finalize purchase
        try {
          await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
        } catch (err) {
          console.error('Error verifying payment on server:', err);
        }
        resolve();
      },
      modal: {
        ondismiss: function () {
          reject(new Error("Checkout dismissed"));
        },
      },
    });

    rzp.open();
  });
}

export default {};
