"use client";

import { useState, useEffect } from 'react';
import { listenToCategories, listenToMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '@/lib/firebase/db';
import { MenuCategory, MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    const unsubscribeCategories = listenToCategories(setCategories);
    const unsubscribeItems = listenToMenuItems(setItems);
    return () => {
      unsubscribeCategories();
      unsubscribeItems();
    };
  }, []);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
      categoryId: formData.get('categoryId') as string,
      isAvailable: formData.get('isAvailable') === 'on',
      type: formData.get('type') as 'veg' | 'non-veg',
    };

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
        toast.success('Item updated successfully');
      } else {
        await addMenuItem(itemData);
        toast.success('Item added successfully');
      }
    } catch {
      toast.error('Failed to save item');
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
  };

    const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        toast.success('Item deleted');
      } catch {
        toast.error('Failed to delete item');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove menu items.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingItem(null);
        }}>
          <DialogTrigger render={
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" defaultValue={editingItem?.name} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (LKR)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={editingItem?.price} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                       <Select name="categoryId" defaultValue={editingItem?.categoryId || categories[0]?.id || ''}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                     {categories.map(c => (
                         <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" defaultValue={editingItem?.description} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" name="image" defaultValue={editingItem?.image} placeholder="https://..." />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch id="isAvailable" name="isAvailable" defaultChecked={editingItem ? editingItem.isAvailable : true} />
                  <Label htmlFor="isAvailable">Available</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Dietary Type</Label>
                  <Select name="type" defaultValue={editingItem?.type || 'veg'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit">{editingItem ? 'Save Changes' : 'Add Item'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search menu items..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{item.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {categories.find(c => c.id === item.categoryId)?.name || 'Uncategorized'}
                  </TableCell>
                  <TableCell className="font-medium">
                    LKR {item.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.type === 'veg' ? 'Veg' : 'Non-veg'}
                    </span>
                  </TableCell>
                  <TableCell>
               <div className="flex items-center space-x-2">
                       <Switch 
                         checked={item.isAvailable} 
                         onCheckedChange={async () => {
                           await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
                         }}
                       />
                       <span className="text-sm text-muted-foreground">
                         {item.isAvailable ? 'In Stock' : 'Sold Out'}
                       </span>
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingItem(item);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
