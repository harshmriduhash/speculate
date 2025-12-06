"use client";

import { useSubscription } from "@/lib/use-subscription";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";

interface PremiumGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

export function PremiumGate({ children, fallback, featureName = "This feature" }: PremiumGateProps) {
  const { status, loading } = useSubscription();

  if (loading) {
    return <div className="p-4 text-center">Loading subscription status...</div>;
  }

  if (!status?.isSubscribed) {
    return (
      fallback || (
        <Card className="p-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">{featureName} is Premium</h3>
          </div>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
            Upgrade to Pro to unlock premium features and analytics.
          </p>
          <Link href="/pricing">
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              View Plans
            </Button>
          </Link>
        </Card>
      )
    );
  }

  return <>{children}</>;
}
