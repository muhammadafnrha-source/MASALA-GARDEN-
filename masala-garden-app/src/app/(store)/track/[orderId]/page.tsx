"use client";

import { useEffect, useState, use } from 'react';
import { listenToOrder } from '@/lib/firebase/db';
import { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, ChefHat, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CURRENCY_SYMBOL } from '@/types';

export default function TrackOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = listenToOrder(orderId, (data) => {
      setOrder(data);
      setError(data ? '' : 'Order not found');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn&apos;t find an order with ID: {orderId}</p>
        <Button asChild><Link href="/menu">Return to Menu</Link></Button>
      </div>
    );
  }

  const steps = [
    { id: 'pending', label: 'Order Placed', icon: Clock },
    { id: 'accepted', label: 'Confirmed', icon: CheckCircle2 },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'ready', label: order.type === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup', icon: ShoppingBag },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  // Handle rejected status
  const isRejected = order.status === 'rejected' || order.status === 'cancelled';

  return (
    <div className="flex-1 bg-muted/20 py-8 md:py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild nativeButton={false} className="-ml-4 mb-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order Status</h1>
              <p className="text-muted-foreground mt-1">Order #{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Placed on</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Card className="mb-8 overflow-hidden">
          <div className="bg-primary/5 p-6 md:p-8 border-b">
            {isRejected ? (
              <div className="text-center text-destructive py-4">
                <h2 className="text-2xl font-bold mb-2">{order.status === 'cancelled' ? 'Order Cancelled' : 'Order Rejected'}</h2>
                <p>This update is reflected in the restaurant dashboard.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 hidden md:block rounded-full z-0"></div>
                
                {/* Active Progress Bar */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 hidden md:block rounded-full z-0 transition-all duration-500 ease-in-out"
                  style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
                ></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                  {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2 text-center">
                        <div 
                          className={`flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full border-2 transition-colors duration-300 ${
                            isActive 
                              ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                              : 'bg-background border-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                        >
                          <Icon className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="text-left md:text-center flex-1">
                          <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-primary font-medium md:hidden mt-0.5">Current Status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <CardContent className="p-6 md:p-8">
            <h3 className="font-semibold text-lg mb-4">Order Details</h3>
            
            <div className="space-y-4 mb-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <span className="font-medium">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{CURRENCY_SYMBOL} {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{CURRENCY_SYMBOL} {order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{CURRENCY_SYMBOL} {order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.type === 'delivery' && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>Included</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                    <span>Total</span>
                    <span>{CURRENCY_SYMBOL} {order.total.toFixed(2)}</span>
                  </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
