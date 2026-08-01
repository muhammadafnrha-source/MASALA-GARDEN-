import { MenuCategory, MenuItem, Offer } from '@/types';

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'wrap', name: 'Wrap', order: 1 },
  { id: 'sandwiches', name: 'Sandwiches', order: 2 },
  { id: 'soup', name: 'Soup', order: 3 },
  { id: 'french-fries', name: 'French Fries', order: 4 },
  { id: 'cheese-ball', name: 'Cheese Ball', order: 5 },
  { id: 'kothu', name: 'Kothu', order: 6 },
  { id: 'rice', name: 'Rice', order: 7 },
  { id: 'mgr-special', name: 'MGR Special', order: 8 },
  { id: 'sahan-mgr', name: 'Sahan MGR', order: 9 },
  { id: 'naan-and-kadai', name: 'Naan and Kadai', order: 10 },
  { id: 'noodle', name: 'Noodle', order: 11 },
  { id: 'pasta-nasi-goreng', name: 'Pasta / Nasi Goreng', order: 12 },
  { id: 'bbq', name: 'BBQ', order: 13 },
  { id: 'devil', name: 'Devil', order: 14 },
  { id: 'wings', name: 'Wings', order: 15 },
  { id: 'drumstick', name: 'Drumstick', order: 16 },
  { id: 'bun', name: 'Bun', order: 17 },
  { id: 'rice-dish', name: 'Rice Dish', order: 18 },
  { id: 'kadai-rice', name: 'Kadai Rice', order: 19 },
  { id: 'pot-rice', name: 'Pot Rice', order: 20 },
  { id: 'nasi-goreng', name: 'Nasi Goreng', order: 21 },
];

export const DUMMY_CATEGORIES: MenuCategory[] = MENU_CATEGORIES;
export const DUMMY_ITEMS: MenuItem[] = [];
export const DUMMY_OFFERS: Offer[] = [];
