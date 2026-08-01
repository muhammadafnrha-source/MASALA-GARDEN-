export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  type?: 'veg' | 'non-veg';
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'rejected' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type OrderSource = 'online' | 'pos';
export type PaymentMethod = 'cash' | 'card' | 'online';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerId?: string;
  customerEmail?: string | null;
  tableNo?: string | null;
  address?: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  type: OrderType;
  createdAt: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  source?: OrderSource;
  receivedAmount?: number;
  balance?: number;
}

export interface Offer {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  validUntil: number;
  isActive: boolean;
}

export const CURRENCY = 'LKR';
export const CURRENCY_SYMBOL = 'LKR';
