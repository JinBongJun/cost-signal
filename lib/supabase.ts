import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // In production this should be configured; for local build-time safety we fall back to a dummy endpoint.
  console.warn('Supabase URL or key is not set. Using fallback Supabase client for build.');
}

const fallbackUrl = 'https://example.com'; // Dummy but valid URL for local builds
const fallbackKey = 'public-anon-key'; // Dummy key; real keys must be provided in env for production

export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseKey || fallbackKey);


