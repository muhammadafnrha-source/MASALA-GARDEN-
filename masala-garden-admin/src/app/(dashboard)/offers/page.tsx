"use client";

import { useEffect, useState } from 'react';
import { addOffer, deleteOffer, listenToOffers, updateOffer } from '@/lib/firebase/db';
import { Offer, CURRENCY_SYMBOL } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToOffers(setOffers);
    return () => unsubscribe();
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validUntilValue = formData.get('validUntil') as string;
    const offer = {
      code: (formData.get('code') as string).trim().toUpperCase(),
      discountType: formData.get('discountType') as 'percentage' | 'fixed',
      value: Number(formData.get('value')),
      minOrderValue: Number(formData.get('minOrderValue')),
      validUntil: validUntilValue ? new Date(validUntilValue).getTime() : Date.now() + 30 * 86400000,
      isActive: formData.get('isActive') === 'on',
    };

    try {
      await addOffer(offer);
      toast.success('Offer added');
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add offer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
          <p className="text-muted-foreground mt-1">Create offers that appear instantly in the customer cart.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button><Plus className="mr-2 h-4 w-4" /> Add Offer</Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Offer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Offer Code</Label>
                <Input id="code" name="code" placeholder="MGR10" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select name="discountType" defaultValue="percentage">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed LKR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" name="value" type="number" min="0" step="0.01" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Minimum Order ({CURRENCY_SYMBOL})</Label>
                  <Input id="minOrderValue" name="minOrderValue" type="number" min="0" step="0.01" defaultValue="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input id="validUntil" name="validUntil" type="date" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="isActive" name="isActive" defaultChecked />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button type="submit" className="w-full">Save Offer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{offer.code}</span>
                <Switch
                  defaultChecked={offer.isActive}
                  onCheckedChange={(checked) => updateOffer(offer.id, { isActive: checked })}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{offer.discountType === 'percentage' ? `${offer.value}% off` : `${CURRENCY_SYMBOL} ${offer.value.toFixed(2)} off`}</p>
              <p className="text-muted-foreground">Minimum: {CURRENCY_SYMBOL} {offer.minOrderValue.toFixed(2)}</p>
              <p className="text-muted-foreground">Valid until: {new Date(offer.validUntil).toLocaleDateString()}</p>
              <Button
                variant="outline"
                className="w-full text-destructive"
                onClick={async () => {
                  await deleteOffer(offer.id);
                  toast.success('Offer deleted');
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardContent>
          </Card>
        ))}
        {offers.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-background p-12 text-center text-muted-foreground">
            No offers added yet.
          </div>
        )}
      </div>
    </div>
  );
}
