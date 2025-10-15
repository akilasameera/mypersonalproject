export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  vpsApiUrl: import.meta.env.VITE_VPS_API_URL || '',
} as const;
