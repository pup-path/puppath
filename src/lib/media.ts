import "server-only";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "media";
const TTL = 60 * 60; // signed URL lifetime in seconds

export async function signedUrl(path: string | null | undefined) {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL);
  return data?.signedUrl ?? null;
}

export async function signedUrls(paths: (string | null | undefined)[]) {
  const clean = paths.filter((p): p is string => !!p);
  if (clean.length === 0) return new Map<string, string>();
  const supabase = await createClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(clean, TTL);
  const map = new Map<string, string>();
  for (const d of data ?? []) if (d.path && d.signedUrl) map.set(d.path, d.signedUrl);
  return map;
}

export interface MediaRow {
  id: string;
  owner_type: string;
  owner_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export async function listMedia(ownerType: string, ownerId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("media").select("*").eq("owner_type", ownerType).eq("owner_id", ownerId).order("sort_order").order("created_at");
  const rows = (data ?? []) as MediaRow[];
  const urls = await signedUrls(rows.map((r) => r.storage_path));
  return rows.map((r) => ({ ...r, url: urls.get(r.storage_path) ?? null }));
}
