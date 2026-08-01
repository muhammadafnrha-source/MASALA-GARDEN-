"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';
import { listenToUserOrders, updateOrderStatus } from '@/lib/firebase/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, CURRENCY_SYMBOL } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const cancellableStatuses = ['pending', 'accepted'] as const;

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToUserOrders(user.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const cancelOrder = async (order: Order) => {
    if (!confirm(`Cancel order ${order.id.slice(0, 8)}?`)) return;
    await updateOrderStatus(order.id, 'cancelled');
    const message = `*Cancelled Order*\nOrder: ${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nTotal: ${CURRENCY_SYMBOL} ${order.total.toFixed(2)}`;
    window.open(`https://wa.me/94763988214?text=${encodeURIComponent(message)}`, '_blank');
    toast.success('Order cancelled');
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-muted/20 py-8 md:py-12">
      <div className="container px-4 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground mt-1">Your previous orders are saved here permanently.</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No previous orders found.</p>
              <Button asChild nativeButton={false}><Link href="/menu">Order Now</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge variant={order.status === 'cancelled' || order.status === 'rejected' ? 'destructive' : 'secondary'} className="w-fit capitalize">
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between gap-3">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{CURRENCY_SYMBOL} {(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="font-bold">Total: {CURRENCY_SYMBOL} {order.total.toFixed(2)}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild nativeButton={false}>
                        <Link href={`/track/${order.id}`}>Track</Link>
                      </Button>
                      {cancellableStatuses.includes(order.status as typeof cancellableStatuses[number]) && (
                        <Button variant="destructive" onClick={() => cancelOrder(order)}>Cancel Order</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
