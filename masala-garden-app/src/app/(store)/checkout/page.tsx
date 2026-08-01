"use client";

import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { createOrder } from '@/lib/firebase/db';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CURRENCY_SYMBOL } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  type: z.enum(['dine-in', 'takeaway', 'delivery']),
  tableNo: z.string().optional(),
  address: z.string().optional(),
  paymentMethod: z.enum(['cash', 'online']),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'dine-in' && (!data.tableNo || data.tableNo.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Table number is required for dine-in',
      path: ['tableNo'],
    });
  }
  if (data.type === 'delivery' && (!data.address || data.address.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Delivery address is required',
      path: ['address'],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getSubtotal, getDiscount, getTotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'takeaway',
      paymentMethod: 'cash',
    },
  });

  const orderType = useWatch({ control, name: 'type' });

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some delicious items to your cart before checking out.</p>
        <Button asChild nativeButton={false}><Link href="/menu">Browse Menu</Link></Button>
      </div>
    );
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const finalTotal = getTotal() + (data.type === 'delivery' ? 500 : 0);
      
      const orderData = {
        customerName: data.name,
        customerPhone: data.phone,
        customerId: user?.uid,
        customerEmail: user?.email,
        type: data.type,
        tableNo: data.type === 'dine-in' ? data.tableNo : null,
        address: data.type === 'delivery' ? data.address : '',
        notes: data.notes || '',
        items: items,
        subtotal: getSubtotal(),
        discount: getDiscount(),
        total: finalTotal,
        status: 'pending' as const,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'pending' as const,
        source: 'online' as const,
      };

      const realId = await createOrder(orderData);
      toast.success('Order placed successfully!');

      let message = `*New Order: ${realId}*\n\n`;
      message += `*Customer Details*\n`;
      message += `Name: ${data.name}\n`;
      message += `Phone: ${data.phone}\n`;
      message += `Type: ${data.type}\n`;
      if (data.type === 'dine-in') message += `Table No: ${data.tableNo}\n`;
      if (data.type === 'delivery') message += `Address: ${data.address}\n`;
      if (data.notes) message += `Notes: ${data.notes}\n`;
      message += `Payment: ${data.paymentMethod}\n\n`;
      message += `*Order Items*\n`;
      items.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (${CURRENCY_SYMBOL} ${(item.price * item.quantity).toFixed(2)})\n`;
      });
      message += `\n*Total: ${CURRENCY_SYMBOL} ${finalTotal.toFixed(2)}*`;
      window.open(`https://wa.me/94763988214?text=${encodeURIComponent(message)}`, '_blank');

      clearCart();
      router.push(`/track/${realId}`);

    } catch (error) {
      console.error(error);
      toast.error('Failed to place order. Please check Firebase configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-muted/20 py-8 md:py-12">
      <div className="container px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild nativeButton={false} className="-ml-4 mb-4">
            <Link href="/menu"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                <CardDescription>We&apos;ll use this to update you on your order.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" {...register('name')} />
                      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+1 234 567 890" {...register('phone')} />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Order Options</CardTitle>
                  <CardDescription>How would you like to receive your food?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Order Type</Label>
                    <RadioGroup defaultValue="takeaway" className="flex flex-col sm:flex-row gap-4">
                      {['dine-in', 'takeaway', 'delivery'].map((type) => (
                        <div key={type} className="flex items-center space-x-2 border rounded-md p-4 flex-1 bg-background">
                          <RadioGroupItem value={type} id={type} {...register('type')} />
                          <Label htmlFor={type} className="capitalize cursor-pointer flex-1">{type.replace('-', ' ')}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {orderType === 'dine-in' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="tableNo">Table Number</Label>
                      <Input id="tableNo" placeholder="e.g. 5" {...register('tableNo')} />
                      {errors.tableNo && <p className="text-sm text-destructive">{errors.tableNo.message}</p>}
                    </div>
                  )}

                  {orderType === 'delivery' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input id="address" placeholder="123 Main St, Apt 4B" {...register('address')} />
                      {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                    </div>
                  )}
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="notes">Customer Notes / Instructions</Label>
                    <Input id="notes" placeholder="No onion, extra spicy, call on arrival..." {...register('notes')} />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="cash" className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2 border rounded-md p-4 flex-1 bg-background">
                      <RadioGroupItem value="cash" id="cash" {...register('paymentMethod')} />
                      <Label htmlFor="cash" className="cursor-pointer flex-1">Cash / Pay at Counter</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-4 flex-1 bg-background opacity-50 cursor-not-allowed">
                      <RadioGroupItem value="online" id="online" disabled {...register('paymentMethod')} />
                      <Label htmlFor="online" className="flex-1">Online Payment (Coming Soon)</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="lg:col-span-5">
            <Card className="sticky top-24">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-4 max-h-[40vh] overflow-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted h-12 w-12 rounded-md overflow-hidden flex-shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                  <h4 className="font-medium text-sm">{item.name}</h4>
                           <p className="text-xs text-muted-foreground">{CURRENCY_SYMBOL} {item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <span className="font-medium text-sm">{CURRENCY_SYMBOL} {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="p-6 space-y-3 bg-muted/20">
                  <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Subtotal</span>
                     <span>{CURRENCY_SYMBOL} {getSubtotal().toFixed(2)}</span>
                  </div>
                   {getDiscount() > 0 && (
                     <div className="flex justify-between text-sm text-green-600 font-medium">
                       <span>Discount</span>
                       <span>-{CURRENCY_SYMBOL} {getDiscount().toFixed(2)}</span>
                     </div>
                   )}
                   {orderType === 'delivery' && (
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Delivery Fee</span>
                       <span>{CURRENCY_SYMBOL} 500.00</span>
                     </div>
                   )}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                   <span>Total</span>
                     <span>{CURRENCY_SYMBOL} {(getTotal() + (orderType === 'delivery' ? 500 : 0)).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-muted/20 border-t">
                <Button 
                  className="w-full h-12 text-base" 
                  size="lg"
                  form="checkout-form"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    `Place Order - ${CURRENCY_SYMBOL} ${(getTotal() + (orderType === 'delivery' ? 500 : 0)).toFixed(2)}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
