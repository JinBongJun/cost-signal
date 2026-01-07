import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

// Use service_role key for server-side operations to bypass RLS
// This is safe because this client is only used server-side
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Prefer service_role key if available (for RLS bypass on server-side)
// Fall back to anon_key if service_role is not set (for backward compatibility)
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  // Only throw error in production (when actually trying to use DB)
  // For build-time, we'll create a dummy client but it won't work for actual operations
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    throw new Error('Missing Supabase environment variables');
  }
  console.warn('Supabase URL or key is not set. Database operations will fail.');
}

// Server-side Supabase client with service_role key (bypasses RLS)
// This is safe because it's only used in API routes and server components
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);


