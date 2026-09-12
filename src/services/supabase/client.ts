import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser/client components.
 * Uses the public anon key — RLS policies handle authorization.
 */
export function createClient() {
  return createBrowserClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  );
}
