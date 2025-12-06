"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SellerUploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "general",
  });

  if (!session) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="text-muted-foreground">Please sign in to upload templates.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await fetch("/api/marketplace/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          content: { nodes: [], edges: [] }, // placeholder content
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      toast.success("Template uploaded! It will be reviewed before publishing.");
      router.push("/seller");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-6">Upload Template</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Customer Feedback Flow"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this template does and who it's for..."
            />
          </div>

          <div>
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              placeholder="299"
              min="100"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="general">General</option>
              <option value="survey">Survey</option>
              <option value="onboarding">Onboarding</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Template"}
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            Your template will be reviewed by our team before appearing on the marketplace. Revenue split: 70% creator, 30% platform.
          </p>
        </form>
      </Card>
    </div>
  );
}
