"use client";

import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { listenToCategories, listenToMenuItems, createOrder } from '@/lib/firebase/db';
import { MenuCategory, MenuItem, CartItem, CURRENCY_SYMBOL } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Printer, Plus, Minus, Trash2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [printSize, setPrintSize] = useState<'80mm' | '45mm'>('45mm');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [receiptMeta, setReceiptMeta] = useState(() => ({
    id: `POS-${Math.floor(Math.random() * 10000)}`,
    printedAt: new Date().toLocaleString(),
  }));
  const [receiptData, setReceiptData] = useState<{
    cart: CartItem[];
    total: number;
    paymentMethod: string;
  } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeCategories = listenToCategories(setCategories);
    const unsubscribeItems = listenToMenuItems(setItems);
    return () => {
      unsubscribeCategories();
      unsubscribeItems();
    };
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${receiptMeta.id}`,
  });

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c =>
      c.id === id ? { ...c, quantity: c.quantity + delta } : c
    ).filter(c => c.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // add tax/discount here if needed

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    return item.isAvailable && matchesSearch && matchesCategory;
  });

  const completeSale = async () => {
    if (cart.length === 0) return;
    const orderId = await createOrder({
      customerName: 'POS Customer',
      customerPhone: 'N/A',
      type: 'takeaway',
      items: cart,
      subtotal,
      discount: 0,
      total,
      status: 'completed',
      paymentMethod,
      paymentStatus: 'paid',
      source: 'pos',
    });
    setReceiptMeta({
      id: orderId,
      printedAt: new Date().toLocaleString(),
    });
    setReceiptData({ cart: [...cart], total, paymentMethod });
    toast.success('POS order saved');
    setTimeout(() => handlePrint(), 0);
    setCart([]);
    setPaymentMethod('cash');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Left side: Menu items */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search items..." 
              className="pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={activeCategory} onValueChange={(value: string | null) => setActiveCategory(value || 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1 border rounded-lg bg-background p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:border-primary transition-colors flex flex-col h-full"
                onClick={() => addToCart(item)}
              >
                <div className="h-24 w-full bg-muted rounded-t-lg bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="p-3 flex flex-col flex-1">
                  <p className="font-semibold text-sm line-clamp-2 mb-1">{item.name}</p>
                  <p className="text-primary font-bold mt-auto">{CURRENCY_SYMBOL} {item.price.toFixed(2)}</p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right side: Cart and Print */}
      <Card className="w-full md:w-96 flex flex-col h-full min-h-0 overflow-hidden">
        <CardHeader className="py-4 border-b shrink-0">
          <CardTitle className="flex justify-between items-center">
            Current Order
            <Badge variant="secondary">{cart.length} Items</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4 min-h-0 overflow-hidden">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Cart is empty
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex flex-col gap-2 bg-muted/30 p-2 rounded-md">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="truncate pr-2">{item.name}</span>
                      <span>{CURRENCY_SYMBOL} {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">{CURRENCY_SYMBOL} {item.price.toFixed(2)} each</p>
                      <div className="flex items-center gap-2 bg-background border rounded-md px-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQty(item.id, -1)}>
                          {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                        </Button>
                        <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQty(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="border-t p-4 bg-muted/10 space-y-4 shrink-0">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{CURRENCY_SYMBOL} {total.toFixed(2)}</span>
            </div>
            <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'online' | null) => setPaymentMethod(value || 'cash')}>
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Select value={printSize} onValueChange={(v: '80mm' | '45mm' | null) => setPrintSize(v || '80mm')}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80mm">80mm</SelectItem>
                  <SelectItem value="45mm">45mm</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="flex-1" 
                onClick={completeSale}
                disabled={cart.length === 0}
              >
                <Printer className="mr-2 h-4 w-4" /> Save & Print
              </Button>
            </div>
            <Button variant="outline" className="w-full text-destructive" onClick={() => setCart([])} disabled={cart.length===0}>
              Clear Cart
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Receipt Template for react-to-print — off-screen, not display:none */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }} aria-hidden="true">
        <div 
          ref={receiptRef} 
          style={{ 
            width: printSize === '80mm' ? '80mm' : '45mm', 
            padding: printSize === '80mm' ? '5mm' : '2mm',
            margin: '0 auto',
            fontFamily: 'monospace',
            color: '#000',
            backgroundColor: '#fff',
            fontSize: printSize === '80mm' ? '12px' : '10px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: printSize === '80mm' ? '18px' : '14px' }}>MASALA GARDEN</h2>
            <p style={{ margin: '2px 0', fontSize: '10px' }}>Main Street, Oluvil</p>
            <p style={{ margin: '2px 0', fontSize: '10px' }}>Tel: +94 763988214</p>
            <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }} />
            <p style={{ margin: '2px 0', fontSize: '10px', textAlign: 'left' }}>
              Date: {receiptMeta.printedAt}
            </p>
            <p style={{ margin: '2px 0', fontSize: '10px', textAlign: 'left' }}>
              Order ID: {receiptMeta.id}
            </p>
            <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }} />
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ textAlign: 'left', padding: '2px 0' }}>Qty x Item</th>
                <th style={{ textAlign: 'right', padding: '2px 0' }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {(receiptData?.cart ?? cart).map(item => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'left', padding: '2px 0', verticalAlign: 'top' }}>
                    {item.quantity}x {item.name}
                    {printSize === '80mm' && <div style={{ fontSize: '10px' }}>@ {CURRENCY_SYMBOL} {(item.price).toFixed(2)}</div>}
                  </td>
                  <td style={{ textAlign: 'right', padding: '2px 0', verticalAlign: 'top' }}>
                    {CURRENCY_SYMBOL} {(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: printSize === '80mm' ? '14px' : '12px' }}>
            <span>TOTAL:</span>
            <span>{CURRENCY_SYMBOL} {(receiptData?.total ?? total).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>PAYMENT:</span>
            <span>{(receiptData?.paymentMethod ?? paymentMethod).toUpperCase()}</span>
          </div>
          
          <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Thank you, visit again</p>
          </div>
        </div>
      </div>
    </div>
  );
}
