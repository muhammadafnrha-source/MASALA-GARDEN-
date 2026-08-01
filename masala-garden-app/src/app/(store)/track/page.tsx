"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin } from 'lucide-react';

export default function TrackSearchPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/track/${orderId.trim()}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order ID to see real-time updates on your delicious food.
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="orderId" 
                  placeholder="e.g. ORD-123456789" 
                  className="pl-9 h-12"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold">
              Track Order
            </Button>
          </form>

          <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/10 flex gap-4">
            <div className="bg-primary/10 p-3 rounded-full h-fit">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Looking for your order ID?</h3>
              <p className="text-sm text-muted-foreground">
                You can find your order ID in the confirmation email or SMS sent to you after placing the order.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 hidden md:block relative bg-muted">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=2071&auto=format&fit=crop)' }} />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-12">
          <div className="space-y-4 max-w-lg text-white">
            <h2 className="text-4xl font-bold">Fast & Fresh</h2>
            <p className="text-lg opacity-90">We prepare your food with love and ensure it reaches you hot and fresh. Track its journey from our kitchen to your table.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
