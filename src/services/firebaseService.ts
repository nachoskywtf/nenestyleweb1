import { ref, set, get, update, remove, onValue } from '../firebase';
import { db } from '../firebase';

// Firebase service with localStorage fallback
export const firebaseService = {
  // Products
  getProducts: async () => {
    try {
      const snapshot = await get(ref(db, 'products'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching products from Firebase, using localStorage fallback:', error);
      const stored = localStorage.getItem('products');
      return stored ? JSON.parse(stored) : [];
    }
  },

  setProducts: async (products: any) => {
    try {
      await set(ref(db, 'products'), products);
    } catch (error) {
      console.error('Error saving products to Firebase, using localStorage fallback:', error);
      localStorage.setItem('products', JSON.stringify(products));
    }
  },

  // Categories
  getCategories: async () => {
    try {
      const snapshot = await get(ref(db, 'categories'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching categories from Firebase, using localStorage fallback:', error);
      const stored = localStorage.getItem('categories');
      return stored ? JSON.parse(stored) : [];
    }
  },

  setCategories: async (categories: any) => {
    try {
      await set(ref(db, 'categories'), categories);
    } catch (error) {
      console.error('Error saving categories to Firebase, using localStorage fallback:', error);
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  },

  // Orders
  getOrders: async () => {
    try {
      const snapshot = await get(ref(db, 'orders'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching orders from Firebase, using localStorage fallback:', error);
      const stored = localStorage.getItem('orders');
      return stored ? JSON.parse(stored) : [];
    }
  },

  setOrders: async (orders: any) => {
    try {
      await set(ref(db, 'orders'), orders);
    } catch (error) {
      console.error('Error saving orders to Firebase, using localStorage fallback:', error);
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  },

  // Bookings
  getBookings: async () => {
    try {
      const snapshot = await get(ref(db, 'bookings'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching bookings from Firebase, using localStorage fallback:', error);
      const stored = localStorage.getItem('bookings');
      return stored ? JSON.parse(stored) : [];
    }
  },

  setBookings: async (bookings: any) => {
    try {
      await set(ref(db, 'bookings'), bookings);
    } catch (error) {
      console.error('Error saving bookings to Firebase, using localStorage fallback:', error);
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }
  },

  // Availability
  getAvailability: async (dateKey: string) => {
    try {
      const snapshot = await get(ref(db, `availability/${dateKey}`));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching availability from Firebase, using localStorage fallback:', error);
      const stored = localStorage.getItem(`nicoke_disponibilidad_${dateKey}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  setAvailability: async (dateKey: string, availability: any) => {
    try {
      await set(ref(db, `availability/${dateKey}`), availability);
    } catch (error) {
      console.error('Error saving availability to Firebase, using localStorage fallback:', error);
      localStorage.setItem(`nicoke_disponibilidad_${dateKey}`, JSON.stringify(availability));
    }
  },

  // Cart
  getCart: async () => {
    try {
      const snapshot = await get(ref(db, 'cart'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching cart from Firebase, using localStorage fallback:', error);
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    }
  },

  setCart: async (cart: any) => {
    try {
      await set(ref(db, 'cart'), cart);
    } catch (error) {
      console.error('Error saving cart to Firebase, using localStorage fallback:', error);
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
};

export default firebaseService;
