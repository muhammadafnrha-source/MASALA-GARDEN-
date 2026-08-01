"use client";

import { useEffect, useState } from 'react';
import { listenToMenuItems, listenToCategories } from '@/lib/firebase/db';
import { MenuItemCard } from '@/components/menu-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MenuCategory, MenuItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function MenuPageClient() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeCategories = listenToCategories((cats) => {
      setCategories(cats);
      setLoading(false);
    });

    const unsubscribeItems = listenToMenuItems((items) => {
      setItems(items);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeItems();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-muted/20 pb-24">
      <div className="bg-primary/5 border-b py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Our Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover our carefully crafted dishes. Authentic recipes prepared with the freshest ingredients and traditional spices.
          </p>
        </div>
      </div>

      <div className="container px-4 mt-8 md:mt-12">
        <Tabs defaultValue="all" className="w-full">
          <div className="sticky top-16 z-40 bg-background/95 backdrop-blur pt-4 pb-2 border-b mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-2">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2.5 text-base shadow-sm border data-[state=inactive]:bg-background transition-all"
                >
                  All
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2.5 text-base shadow-sm border data-[state=inactive]:bg-background transition-all"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          <TabsContent value="all" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">All Menu Items</h2>
              <div className="h-1 w-12 bg-primary rounded-full mb-6"></div>
            </div>
            {items.filter(item => item.isAvailable).length === 0 ? (
              <div className="text-center py-12 bg-background border rounded-xl border-dashed">
                <p className="text-muted-foreground">No menu items available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
                {items.filter(item => item.isAvailable).map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          {categories.map((category) => {
            const categoryItems = items.filter(item => item.categoryId === category.id && item.isAvailable);
            return (
              <TabsContent key={category.id} value={category.id} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">{category.name}</h2>
                  <div className="h-1 w-12 bg-primary rounded-full mb-6"></div>
                </div>
                
                {categoryItems.length === 0 ? (
                  <div className="text-center py-12 bg-background border rounded-xl border-dashed">
                    <p className="text-muted-foreground">No items available in this category yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
                    {categoryItems.map(item => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
