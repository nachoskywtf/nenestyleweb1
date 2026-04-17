import { createClient } from '@supabase/supabase-js';

// Supabase configuration - UPDATE THESE WITH YOUR CREDENTIALS
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database schema (for reference):
// Table: bookings
// - id (text, primary key)
// - client_name (text)
// - client_phone (text)
// - client_email (text)
// - service (text)
// - date (text) - format: YYYY-MM-DD
// - time (text) - format: HH:MM
// - notes (text)
// - status (text) - 'confirmed' | 'cancelled'
// - created_at (timestamp)
//
// Table: availability
// - id (text, primary key)
// - date (text) - format: YYYY-MM-DD
// - time (text) - format: HH:MM
// - status (text) - 'available' | 'booked' | 'blocked'
// - created_at (timestamp)

export default supabase;
