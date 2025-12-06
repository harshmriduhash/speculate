"use client";
import { useEffect, useState } from "react";

export type SubscriptionStatus = {
  isSubscribed: boolean;
  tier?: string | null;
  subscription?: any;
  lastPayment?: any;
};

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchStatus() {
      setLoading(true);
      try {
        const res = await fetch('/api/user/subscription-status');
        const data = await res.json();
        if (mounted) setStatus(data);
      } catch (err) {
        console.error('Failed to fetch subscription status', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStatus();

    return () => { mounted = false; };
  }, []);

  return { status, loading };
}

export default useSubscription;
