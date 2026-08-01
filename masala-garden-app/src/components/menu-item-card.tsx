"use client";

import { MenuItem } from '@/types';
import { useCartStore } from '@/lib/store';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const formatPrice = useCartStore((state) => state.formatPrice);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item);
    setAdded(true);
    toast.success(`Added ${item.name} to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full rounded-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50 group">
      <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${item.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-lg py-1 px-4">Sold Out</Badge>
          </div>
        )}
        {item.type && (
          <div className="absolute top-3 right-3 bg-background/95 rounded-full p-1.5 shadow-md">
            <div className={`h-3 w-3 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-background/95 rounded-full px-3 py-1.5 shadow-md">
          <span className="font-bold text-primary">{formatPrice(item.price)}</span>
        </div>
      </div>
      <CardHeader className="p-3 pb-2 flex-1">
        <CardTitle className="text-sm md:text-base font-bold line-clamp-1">{item.name}</CardTitle>
        <CardDescription className="line-clamp-2 mt-1 text-xs md:text-sm">{item.description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-3 pt-1 mt-auto">
        <Button 
          className="w-full font-semibold h-9 text-xs md:text-sm" 
          onClick={handleAdd}
          disabled={!item.isAvailable}
          variant={added ? "secondary" : "default"}
        >
          {added ? (
            <><Check className="mr-2 h-4 w-4" /> Added</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" /> Add to Cart</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
