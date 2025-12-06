import { TEMPLATES } from '@/config/templates';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { openRazorpayCheckout } from '@/lib/razorpay-client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function TemplatesPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const handleBuy = async (templateId: string) => {
    try {
      setLoading(templateId);
      const template = TEMPLATES.find((t) => t.id === templateId)!;
      const amountPaise = Math.round(template.price * 100);

      const res = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt: `template:${templateId}` }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create order');

      const order = data.order;
      const key = data.key;

      await openRazorpayCheckout(order, key, { name: template.name, description: template.description });
      toast.success('Checkout opened. Complete payment to finalize.');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Payment failed');
    } finally {
      setLoading(null);
    }
  };

  const filtered = TEMPLATES.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-6">
        <input className="w-full p-2 border rounded" placeholder="Search templates..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map((t) => (
          <Card key={t.id} className="p-6">
            <h3 className="text-xl font-semibold">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-bold">₹{t.price}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setSelected(t)}>Preview</Button>
                <Button onClick={() => handleBuy(t.id)} disabled={!!loading}>
                  {loading === t.id ? 'Processing...' : 'Buy Template'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          {selected && (
            <div>
              <h3 className="text-xl font-semibold">{selected.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{selected.description}</p>
              <pre className="mt-4 p-3 bg-gray-100 rounded text-sm overflow-auto">{JSON.stringify(selected.content, null, 2)}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
