/**
 * Supabase connection settings.
 *
 * PUPPATH_SUPABASE_* take precedence so the app is immune to the Vercel
 * Supabase marketplace integration, which injects NEXT_PUBLIC_SUPABASE_* for
 * whichever project it provisioned. NEXT_PUBLIC_* remain as the fallback for
 * local development.
 */
export const SUPABASE_URL = process.env.PUPPATH_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.PUPPATH_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase env missing: set PUPPATH_SUPABASE_URL and PUPPATH_SUPABASE_ANON_KEY");
}
