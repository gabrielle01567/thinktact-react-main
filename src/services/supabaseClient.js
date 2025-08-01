import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid TDZ issues with import.meta.env
let supabaseClient = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables not found. Image upload functionality will be disabled.');
      console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
    }

    // Create client with fallback for missing credentials
    supabaseClient = supabaseUrl && supabaseAnonKey 
      ? createClient(supabaseUrl, supabaseAnonKey)
      : null;
  }
  return supabaseClient;
};

// Export the lazy-loaded client
export const supabase = {
  get client() {
    return getSupabaseClient();
  }
};

// Proxy all Supabase methods
const supabaseMethods = ['from', 'auth', 'storage', 'rpc', 'rest'];
supabaseMethods.forEach(method => {
  supabase[method] = function(...args) {
    const client = getSupabaseClient();
    return client ? client[method](...args) : null;
  };
});

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null;
}; 