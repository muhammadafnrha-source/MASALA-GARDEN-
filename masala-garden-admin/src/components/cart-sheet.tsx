"use client";

import { useCartStore } from '@/lib/store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { CURRENCY_SYMBOL } from '@/types';

export function CartSheet() {
  const { items, updateQuantity, getTotal, getSubtotal } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {itemCount}
            </span>
          )}
          <span className="sr-only">Cart</span>
        </Button>
      } />
      <SheetContent className="flex flex-col w-full sm:max-w-md border-l shadow-2xl">
        <SheetHeader className="px-1 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
             <Button variant="outline" asChild nativeButton={false} className="mt-2">
               <Link href="/menu">Browse Menu</Link>
             </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 pr-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="flex-1">
              <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                       <p className="text-sm font-semibold text-primary mt-1">{CURRENCY_SYMBOL} {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                      </Button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="mt-auto border-t pt-4 space-y-4">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{CURRENCY_SYMBOL} {getSubtotal().toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{CURRENCY_SYMBOL} {getTotal().toFixed(2)}</span>
                    </div>
                  </div>
              
              <Button className="w-full h-12 text-base font-semibold" asChild nativeButton={false}>
                 <Link href="/checkout">
                   Checkout <ArrowRight className="ml-2 h-4 w-4" />
                 </Link>
               </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
