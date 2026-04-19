import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase environment variables missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Enforce HTTPS for WebSocket connections
if (supabaseUrl && supabaseUrl.startsWith('http:')) {
  supabaseUrl = supabaseUrl.replace('http:', 'https:');
  console.warn('Converting Supabase URL to HTTPS for secure WebSocket connection');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '', 
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  }
);

export default supabase;
