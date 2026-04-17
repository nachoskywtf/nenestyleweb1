import { ref, set, get, update, remove, onValue } from '../firebase';
import { db } from '../firebase';

// Firebase service for real-time data sync
export const firebaseService = {
  // Products
  getProducts: async () => {
    try {
      const snapshot = await get(ref(db, 'products'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching products from Firebase:', error);
      return [];
    }
  },

  setProducts: async (products: any) => {
    try {
      await set(ref(db, 'products'), products);
    } catch (error) {
      console.error('Error saving products to Firebase:', error);
    }
  },

  // Categories
  getCategories: async () => {
    try {
      const snapshot = await get(ref(db, 'categories'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching categories from Firebase:', error);
      return [];
    }
  },

  setCategories: async (categories: any) => {
    try {
      await set(ref(db, 'categories'), categories);
    } catch (error) {
      console.error('Error saving categories to Firebase:', error);
    }
  },

  // Orders
  getOrders: async () => {
    try {
      const snapshot = await get(ref(db, 'orders'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching orders from Firebase:', error);
      return [];
    }
  },

  setOrders: async (orders: any) => {
    try {
      await set(ref(db, 'orders'), orders);
    } catch (error) {
      console.error('Error saving orders to Firebase:', error);
    }
  },

  // Bookings
  getBookings: async () => {
    try {
      const snapshot = await get(ref(db, 'bookings'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching bookings from Firebase:', error);
      return [];
    }
  },

  setBookings: async (bookings: any) => {
    try {
      await set(ref(db, 'bookings'), bookings);
    } catch (error) {
      console.error('Error saving bookings to Firebase:', error);
    }
  },

  // Availability
  getAvailability: async (dateKey: string) => {
    try {
      const snapshot = await get(ref(db, `availability/${dateKey}`));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching availability from Firebase:', error);
      return [];
    }
  },

  setAvailability: async (dateKey: string, availability: any) => {
    try {
      await set(ref(db, `availability/${dateKey}`), availability);
    } catch (error) {
      console.error('Error saving availability to Firebase:', error);
    }
  },

  // Cart
  getCart: async () => {
    try {
      const snapshot = await get(ref(db, 'cart'));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error fetching cart from Firebase:', error);
      return [];
    }
  },

  setCart: async (cart: any) => {
    try {
      await set(ref(db, 'cart'), cart);
    } catch (error) {
      console.error('Error saving cart to Firebase:', error);
    }
  }
};

export default firebaseService;
