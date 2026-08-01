"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, ShoppingBag, Users, TrendingUp, Printer, Trash2 } from 'lucide-react';
import { clearOrderHistory, listenToAllOrders } from '@/lib/firebase/db';
import { Order, CURRENCY_SYMBOL } from '@/types';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const unsubscribe = listenToAllOrders(setOrders);
    return () => unsubscribe();
  }, []);

  const activeOrders = orders.filter(order => ['pending', 'accepted', 'preparing', 'ready'].includes(order.status));
  const filteredHistory = useMemo(() => (
    dateFilter
      ? orders.filter(order => new Date(order.createdAt).toISOString().slice(0, 10) === dateFilter)
      : orders
  ), [dateFilter, orders]);
  const onlineHistory = filteredHistory.filter(order => (order.source || 'online') === 'online');
  const posHistory = filteredHistory.filter(order => order.source === 'pos');
  const totalRevenue = filteredHistory.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = filteredHistory.length > 0 ? totalRevenue / filteredHistory.length : 0;

  const stats = [
    { title: 'Revenue', value: `${CURRENCY_SYMBOL} ${totalRevenue.toFixed(2)}`, icon: DollarSign, detail: 'Filtered history' },
    { title: 'Active Orders', value: activeOrders.length.toString(), icon: ShoppingBag, detail: 'Live right now' },
    { title: 'Customers', value: new Set(filteredHistory.map(o => o.customerPhone)).size.toString(), icon: Users, detail: 'Filtered unique phones' },
    { title: 'Avg Order', value: `${CURRENCY_SYMBOL} ${avgOrderValue.toFixed(2)}`, icon: TrendingUp, detail: 'Filtered history' },
  ];

  const handleClearHistory = async () => {
    if (!confirm('This will permanently clear all order history. Continue?')) return;
    await clearOrderHistory();
    toast.success('Order history cleared');
  };

  return (
    <div className="space-y-8 rounded-2xl bg-zinc-950 p-4 text-white md:p-6 print:bg-white print:text-black">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #order-report, #order-report * { visibility: visible; }
          #order-report { position: absolute; left: 0; top: 0; width: 100%; padding: 16px; }
          .no-print { display: none !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>

      <div className="no-print flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Real-time restaurant performance and professional order reports.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-white text-black" />
          <Button onClick={() => window.print()} className="bg-yellow-400 text-black hover:bg-yellow-300">
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
          <Button variant="destructive" onClick={handleClearHistory}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear History
          </Button>
        </div>
      </div>

      <div className="no-print grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-zinc-800 bg-zinc-900 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="no-print border-zinc-800 bg-zinc-900 text-white">
        <CardHeader>
          <CardTitle>Live Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">No active orders yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {activeOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                  <div className="flex justify-between gap-3 font-medium">
                    <span>#{order.id.slice(0, 8)}</span>
                    <span>{CURRENCY_SYMBOL} {order.total.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{order.customerName} - {order.status} - {order.type}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <section id="order-report" className="rounded-xl bg-white p-4 text-black">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Masala Garden</h2>
          <p>Main Street, Oluvil | +94 763988214 | masalagardenoluvil@gmail.com</p>
          <h3 className="mt-3 text-lg font-semibold">Order History Report</h3>
          <p className="text-sm">Date filter: {dateFilter || 'All dates'} | Generated: {new Date().toLocaleString()}</p>
        </div>
        <ReportTable title="Online Orders" orders={onlineHistory} />
        <ReportTable title="POS Orders" orders={posHistory} />
        <div className="mt-6 border-t pt-3 text-right font-bold">
          Grand Total: {CURRENCY_SYMBOL} {totalRevenue.toFixed(2)}
        </div>
      </section>
    </div>
  );
}

function ReportTable({ title, orders }: { title: string; orders: Order[] }) {
  const total = orders.reduce((sum, order) => sum + order.total, 0);
  return (
    <div className="mb-6">
      <h3 className="mb-2 font-bold">{title}</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-left">Order ID</th>
            <th className="border p-2 text-left">Customer</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Payment</th>
            <th className="border p-2 text-left">Items</th>
            <th className="border p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td className="border p-3 text-center" colSpan={7}>No orders found.</td></tr>
          ) : (
            orders.map(order => (
              <tr key={order.id}>
                <td className="border p-2">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="border p-2">#{order.id.slice(0, 8)}</td>
                <td className="border p-2">{order.customerName}<br />{order.customerPhone}</td>
                <td className="border p-2">{order.status}</td>
                <td className="border p-2">{order.paymentMethod}</td>
                <td className="border p-2">{order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}</td>
                <td className="border p-2 text-right">{CURRENCY_SYMBOL} {order.total.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td className="border p-2 text-right font-bold" colSpan={6}>Subtotal</td>
            <td className="border p-2 text-right font-bold">{CURRENCY_SYMBOL} {total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
