import { db } from './config';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { MenuCategory, MenuItem, Order, Offer } from '@/types';
import { MENU_CATEGORIES } from '@/lib/data';

// MENU CATEGORIES
export async function getMenuCategories(): Promise<MenuCategory[]> {
  try {
    const q = query(collection(db, 'menu_categories'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuCategory));
    return categories.length > 0 ? categories : MENU_CATEGORIES;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// MENU ITEMS
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const q = query(collection(db, 'menu_items'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, isAvailable: true, ...data } as MenuItem;
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

// REAL-TIME MENU LISTENER
export function listenToMenuItems(callback: (items: MenuItem[]) => void) {
  const q = query(collection(db, 'menu_items'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, isAvailable: true, ...data } as MenuItem;
      });
      callback(items);
    },
    (error) => {
      console.error('listenToMenuItems error:', error);
    }
  );
}

// REAL-TIME CATEGORIES LISTENER
export function listenToCategories(callback: (categories: MenuCategory[]) => void) {
  const q = query(collection(db, 'menu_categories'));
  return onSnapshot(
    q,
    (snapshot) => {
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuCategory));
      categories.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      callback(categories.length > 0 ? categories : MENU_CATEGORIES);
    },
    (error) => {
      console.error('listenToCategories error:', error);
      callback(MENU_CATEGORIES);
    }
  );
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'menu_items'), item);
  return docRef.id;
}

export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<void> {
  const docRef = doc(db, 'menu_items', id);
  await updateDoc(docRef, item);
}

export async function deleteMenuItem(id: string): Promise<void> {
  const docRef = doc(db, 'menu_items', id);
  await deleteDoc(docRef);
}

// ORDERS
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const snapshot = await getDoc(doc(db, 'orders', orderId));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return { id: snapshot.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export function listenToOrder(orderId: string, callback: (order: Order | null) => void) {
  return onSnapshot(
    doc(db, 'orders', orderId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      const data = snapshot.data();
      callback({ id: snapshot.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Order);
    },
    (error) => {
      console.error('listenToOrder error:', error);
    }
  );
}

// REALTIME LISTENERS (For Admin)
export function listenToActiveOrders(callback: (orders: Order[]) => void) {
  const q = query(
    collection(db, 'orders'),
    where('status', 'in', ['pending', 'accepted', 'preparing', 'ready']),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Order;
      });
      callback(orders);
    },
    (error) => {
      console.error('listenToActiveOrders error:', error);
    }
  );
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, { status });
}

export function listenToUserOrders(userId: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), where('customerId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Order;
      }).sort((a, b) => b.createdAt - a.createdAt);
      callback(orders);
    },
    (error) => {
      console.error('listenToUserOrders error:', error);
    }
  );
}

// OFFERS
export async function getActiveOffers(): Promise<Offer[]> {
  try {
    const q = query(collection(db, 'offers'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
  } catch (error) {
    console.error("Error fetching offers:", error);
    return [];
  }
}

export function listenToActiveOffers(callback: (offers: Offer[]) => void) {
  const q = query(collection(db, 'offers'), where('isActive', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)));
    },
    (error) => {
      console.error('listenToActiveOffers error:', error);
    }
  );
}
