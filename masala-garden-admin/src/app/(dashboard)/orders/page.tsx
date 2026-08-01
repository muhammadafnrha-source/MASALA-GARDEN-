"use client";

import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Order } from '@/types';
import { listenToActiveOrders, updateOrderStatus } from '@/lib/firebase/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Printer } from 'lucide-react';
import { CURRENCY_SYMBOL } from '@/types';

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Bill-${printingOrder?.id || 'order'}`,
  });

  useEffect(() => {
    const unsubscribe = listenToActiveOrders((newOrders) => {
      setOrders(newOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Optimistic update for mock UI
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      // Attempt Firebase update
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${orderId} updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      'pending': { label: 'New', variant: 'destructive' },
      'accepted': { label: 'Accepted', variant: 'default' },
      'preparing': { label: 'Preparing', variant: 'secondary' },
      'ready': { label: 'Ready', variant: 'outline' },
    };
    const s = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Orders</h1>
          <p className="text-muted-foreground mt-1">Manage incoming orders in real-time.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-background border rounded-xl border-dashed">
          <p className="text-muted-foreground">No active orders right now.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">#{order.id.replace('ORD-', '')}</CardTitle>
                  {getStatusBadge(order.status)}
                </div>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">{order.customerName}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{order.customerPhone}</span>
                    <span className="capitalize font-medium text-primary">
                      {order.type} {order.type === 'dine-in' ? `(T-${order.tableNo})` : ''}
                    </span>
                  </div>
                  {order.address && <div>Address: {order.address}</div>}
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <ul className="space-y-3 mb-4">
                  {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                       <span className="font-medium">{item.quantity}x {item.name}</span>
                       <span>{CURRENCY_SYMBOL} {(item.price * item.quantity).toFixed(2)}</span>
                     </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex-col gap-4 border-t pt-4 bg-muted/10">
                 <div className="flex justify-between w-full font-bold">
                   <span>Total</span>
                   <span>{CURRENCY_SYMBOL} {order.total.toFixed(2)}</span>
                 </div>
                
                <div className="flex gap-2 w-full">
                  <Select 
                    value={order.status} 
                    onValueChange={(val) => handleStatusChange(order.id, val as Order['status'])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="completed">Complete Order</SelectItem>
                      <SelectItem value="rejected">Reject Order</SelectItem>
                      <SelectItem value="cancelled">Cancel Order</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setPrintingOrder(order);
                      setTimeout(() => handlePrint(), 0);
                    }}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <div className="hidden">
        <div ref={receiptRef} style={{ width: '45mm', padding: '3mm', fontFamily: 'monospace', color: '#000', background: '#fff', fontSize: '10px', textAlign: 'center' }}>
          {printingOrder && (
            <>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 4 }}>
                <strong style={{ fontSize: '13px' }}>MASALA GARDEN</strong>
                <div>Main Street, Oluvil</div>
                <div>Tel: +94 763988214</div>
                <div style={{ marginTop: 4 }}>OFFICIAL RESTAURANT INVOICE</div>
                <div>Bill #{printingOrder.id.slice(0, 10)}</div>
                <div>{new Date(printingOrder.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ borderBottom: '1px dashed #000', padding: '4px 0', textAlign: 'left' }}>
                <div>{printingOrder.customerName}</div>
                <div>{printingOrder.customerPhone}</div>
                <div>Type: {printingOrder.type}</div>
                <div>Payment: {printingOrder.paymentMethod}</div>
                {printingOrder.address && <div>{printingOrder.address}</div>}
                {printingOrder.notes && <div>Notes: {printingOrder.notes}</div>}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <tbody>
                  {printingOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '2px 0' }}>{item.quantity}x {item.name}</td>
                      <td style={{ padding: '2px 0', textAlign: 'right' }}>{CURRENCY_SYMBOL} {(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ borderTop: '1px dashed #000', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>TOTAL</span>
                <span>{CURRENCY_SYMBOL} {printingOrder.total.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px dashed #000', marginTop: 8, paddingTop: 6 }}>
                Thank you, visit again
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
