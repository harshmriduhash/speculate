"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { useSubscription } from "@/lib/use-subscription";
import Link from "next/link";

interface Invoice {
  id: string;
  type: 'payment' | 'subscription';
  amount: number;
  currency: string;
  status: string;
  date: string;
}

export default function BillingPage() {
  const { status, loading: subLoading } = useSubscription();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/invoices");
        if (!res.ok) throw new Error("Failed to fetch invoices");
        const data = await res.json();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Error loading invoices:", error);
        toast.error("Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to cancel? You'll lose access at the end of the billing period.")) return;
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      toast.success("Subscription canceled");
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      toast.error(error?.message || "Failed to cancel subscription");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : status?.isSubscribed ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    <Badge variant="default" className="ml-2">
                      Active
                    </Badge>
                  </p>
                  {status.subscription && (
                    <p className="text-sm text-muted-foreground">
                      Renews on {new Date(status.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {status.subscription && (
                  <Button variant="outline" onClick={() => handleCancelSubscription(status.subscription.id)}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No active subscription</p>
              <Link href="/pricing">
                <Button>View Plans</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b">
                      <td className="p-2">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="p-2 capitalize">{inv.type}</td>
                      <td className="p-2">{inv.currency} {inv.amount}</td>
                      <td className="p-2">
                        <Badge
                          variant={inv.status === "COMPLETED" ? "default" : "outline"}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No payment history</h3>
              <p className="text-sm text-muted-foreground">
                Your payment history will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
