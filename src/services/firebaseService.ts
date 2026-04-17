import { ref, set, get } from '../firebase';
import { db } from '../firebase';

// Firebase service with localStorage fallback
export const firebaseService = {
  // Bookings
  getBookings: async () => {
    try {
      const snapshot = await get(ref(db, 'bookings'));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      // Fallback to localStorage
      const stored = localStorage.getItem('bookings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error fetching bookings from Firebase:', error);
      const stored = localStorage.getItem('bookings');
      return stored ? JSON.parse(stored) : [];
    }
  },

  setBookings: async (bookings: any) => {
    try {
      await set(ref(db, 'bookings'), bookings);
      localStorage.setItem('bookings', JSON.stringify(bookings));
    } catch (error) {
      console.error('Error saving bookings to Firebase:', error);
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }
  },

  // Availability
  getAvailability: async (dateKey: string) => {
    try {
      const snapshot = await get(ref(db, `availability/${dateKey}`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      // Fallback to localStorage
      const stored = localStorage.getItem(`nicoke_disponibilidad_${dateKey}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error fetching availability from Firebase:', error);
      const stored = localStorage.getItem(`nicoke_disponibilidad_${dateKey}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  setAvailability: async (dateKey: string, availability: any) => {
    try {
      await set(ref(db, `availability/${dateKey}`), availability);
      localStorage.setItem(`nicoke_disponibilidad_${dateKey}`, JSON.stringify(availability));
    } catch (error) {
      console.error('Error saving availability to Firebase:', error);
      localStorage.setItem(`nicoke_disponibilidad_${dateKey}`, JSON.stringify(availability));
    }
  }
};

export default firebaseService;
