export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://ifllwtljorvgcnthicuy.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbGx3dGxqb3J2Z2NudGhpY3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDE5NDIsImV4cCI6MjA2OTU3Nzk0Mn0.mbKCd-EKcaQWn2zmzwPeep190TS5XIkni2cMu57Fzr0',
  vpsApiUrl: import.meta.env.VITE_VPS_API_URL || 'https://mypersonalprojects.com/backend/api',
} as const;
