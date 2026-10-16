import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

/** Cookie-less anon client for public forms. Only reaches the security-definer RPCs granted to anon. */
export function createAnonClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
