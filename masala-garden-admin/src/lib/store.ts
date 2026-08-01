import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem, Offer } from '@/types';
import { CURRENCY_SYMBOL } from '@/types';

interface CartState {
  items: CartItem[];
  appliedOffer: Offer | null;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyOffer: (offer: Offer | null) => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  formatPrice: (price: number) => string;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedOffer: null,
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [], appliedOffer: null }),
      applyOffer: (offer) => set({ appliedOffer: offer }),
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getDiscount: () => {
        const offer = get().appliedOffer;
        const subtotal = get().getSubtotal();
        if (!offer || subtotal < offer.minOrderValue) return 0;
        
        if (offer.discountType === 'percentage') {
          return (subtotal * offer.value) / 100;
        }
        return offer.value;
      },
      getTotal: () => {
        return Math.max(0, get().getSubtotal() - get().getDiscount());
      },
      formatPrice: (price: number) => {
        return `${CURRENCY_SYMBOL} ${price.toFixed(2)}`;
      },
    }),
    {
      name: 'restaurant-cart',
    }
  )
);
