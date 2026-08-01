"use client";

import { useEffect, useState } from 'react';
import { listenToAllOrders } from '@/lib/firebase/db';
import { Order, CURRENCY_SYMBOL } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubscribe = listenToAllOrders(setOrders);
    return () => unsubscribe();
  }, []);

  const customers = Array.from(
    orders.reduce((map, order) => {
      if (order.source === 'pos') return map;
      const key = order.customerPhone || order.customerName;
      const current = map.get(key) || {
        name: order.customerName,
        phone: order.customerPhone,
        address: order.address || '',
        orders: 0,
        total: 0,
        lastOrder: order.createdAt,
      };
      current.orders += 1;
      current.total += order.total;
      current.lastOrder = Math.max(current.lastOrder, order.createdAt);
      if (order.address) current.address = order.address;
      map.set(key, current);
      return map;
    }, new Map<string, { name: string; phone: string; address: string; orders: number; total: number; lastOrder: number }>())
  ).map(([, customer]) => customer);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground mt-1">Live customer list built from online orders.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {customers.map(customer => (
          <Card key={customer.phone || customer.name}>
            <CardHeader>
              <CardTitle className="text-lg">{customer.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{customer.phone}</p>
              {customer.address && <p className="text-muted-foreground">{customer.address}</p>}
              <p>{customer.orders} orders - {CURRENCY_SYMBOL} {customer.total.toFixed(2)}</p>
              <p className="text-muted-foreground">Last order: {new Date(customer.lastOrder).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
        {customers.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-background p-12 text-center text-muted-foreground">
            No customers yet.
          </div>
        )}
      </div>
    </div>
  );
}
