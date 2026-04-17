import { supabase } from '../supabase';

export interface Booking {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Availability {
  id: string;
  date: string;
  time: string;
  status: 'available' | 'booked' | 'blocked';
  created_at: string;
}

export const supabaseService = {
  async getBookings(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  async createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...booking,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled'): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  async deleteBooking(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  subscribeToBookings(callback: (bookings: Booking[]) => void) {
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        async () => {
          const bookings = await this.getBookings();
          callback(bookings);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async getAvailability(date: string): Promise<Availability[]> {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching availability:', error);
      return [];
    }
  },

  async setAvailability(date: string, availability: Availability[]): Promise<void> {
    try {
      await supabase
        .from('availability')
        .delete()
        .eq('date', date);

      const { error } = await supabase
        .from('availability')
        .insert(availability);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error setting availability:', error);
      throw error;
    }
  },

  async updateAvailabilitySlot(date: string, time: string, status: 'available' | 'booked' | 'blocked'): Promise<void> {
    try {
      const { error } = await supabase
        .from('availability')
        .upsert({
          id: `${date}-${time}`,
          date,
          time,
          status,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating availability slot:', error);
      throw error;
    }
  },

  subscribeToAvailability(date: string, callback: (availability: Availability[]) => void) {
    const channel = supabase
      .channel(`availability-${date}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability',
          filter: `date=eq.${date}`
        },
        async () => {
          const availability = await this.getAvailability(date);
          callback(availability);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

export default supabaseService;
