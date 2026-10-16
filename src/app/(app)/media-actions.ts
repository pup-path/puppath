"use server";

import { revalidatePath } from "next/cache";
import { createClient, getMember } from "@/lib/supabase/server";

const BUCKET = "media";
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Upload one image. owner_type decides where it is recorded:
 *   dog   → dogs.photo_path (single primary photo)
 *   other → media row
 */
export async function uploadPhoto(ownerType: "dog" | "puppy" | "litter" | "application" | "litter_update", ownerId: string, revalidate: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo first." };
  if (!ALLOWED.has(file.type)) return { error: "JPEG, PNG or WebP only." };
  if (file.size > 6 * 1024 * 1024) return { error: "That photo is too big after resizing. Try another." };

  const member = await getMember();
  const supabase = await createClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${member.breederId}/${ownerType}/${ownerId}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) return { error: upErr.message };

  if (ownerType === "dog") {
    const { error } = await supabase.from("dogs").update({ photo_path: path }).eq("id", ownerId);
    if (error) return { error: error.message };
  } else {
    const caption = String(formData.get("caption") ?? "").trim() || null;
    const { error } = await supabase.from("media").insert({ breeder_id: member.breederId, owner_type: ownerType, owner_id: ownerId, storage_path: path, caption });
    if (error) return { error: error.message };
  }
  revalidatePath(revalidate);
  return { ok: true };
}

export async function deletePhoto(mediaId: string, revalidate: string) {
  const supabase = await createClient();
  const { data: row } = await supabase.from("media").select("storage_path").eq("id", mediaId).maybeSingle();
  if (!row) return { error: "Not found" };
  await supabase.storage.from(BUCKET).remove([row.storage_path]);
  const { error } = await supabase.from("media").delete().eq("id", mediaId);
  if (error) return { error: error.message };
  revalidatePath(revalidate);
  return { ok: true };
}
