"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Move a waitlisted application up or down one place by swapping positions with its neighbour. */
export async function moveWaitlist(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("applications")
    .select("id, waitlist_position")
    .eq("stage", "waitlisted")
    .order("waitlist_position", { ascending: true });
  if (error) return { error: error.message };

  const list = (rows ?? []).filter((r) => r.waitlist_position != null);
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return { error: "Not on the waitlist" };
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) return { ok: true };

  const a = list[idx];
  const b = list[swapIdx];
  // Three-step swap avoids any transient duplicate positions.
  const r1 = await supabase.from("applications").update({ waitlist_position: -1 }).eq("id", a.id);
  if (r1.error) return { error: r1.error.message };
  const r2 = await supabase.from("applications").update({ waitlist_position: a.waitlist_position }).eq("id", b.id);
  if (r2.error) return { error: r2.error.message };
  const r3 = await supabase.from("applications").update({ waitlist_position: b.waitlist_position }).eq("id", a.id);
  if (r3.error) return { error: r3.error.message };

  revalidatePath("/waitlist");
  revalidatePath("/pipeline");
  return { ok: true };
}

/** Renumber 1..n in current order. Fixes gaps left by people leaving the list. */
export async function compactWaitlist() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("applications")
    .select("id, waitlist_position, deposit_received_at, created_at")
    .eq("stage", "waitlisted")
    .order("waitlist_position", { ascending: true, nullsFirst: false })
    .order("deposit_received_at", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return { error: error.message };
  let n = 1;
  for (const r of rows ?? []) {
    if (r.waitlist_position !== n) {
      const u = await supabase.from("applications").update({ waitlist_position: n }).eq("id", r.id);
      if (u.error) return { error: u.error.message };
    }
    n++;
  }
  revalidatePath("/waitlist");
  revalidatePath("/pipeline");
  return { ok: true };
}
