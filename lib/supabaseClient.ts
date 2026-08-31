import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Browser client - uses the public anon key only. Use in client components.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/**
 * Server client - requires the service role key. Do NOT expose this to client code.
 * This will throw if SUPABASE_SERVICE_ROLE_KEY is not present.
 */
export function createServerSupabaseClient(): SupabaseClient {
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!serviceRole) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Server-side operations require the service role key.");
  }
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}
