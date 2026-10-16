"use server";

import { revalidatePath } from "next/cache";
import { createClient, getMember } from "@/lib/supabase/server";
import type { AllocationStatus } from "@/lib/types";

const TRANSITIONS: Record<AllocationStatus, AllocationStatus[]> = {
  offered: ["accepted", "declined", "cancelled"],
  accepted: ["confirmed", "cancelled"],
  confirmed: ["collected", "cancelled"],
  collected: [],
  declined: [],
  cancelled: [],
};

function revalidate(litterId: string, puppyId: string, applicationId: string) {
  revalidatePath(`/litters/${litterId}`);
  revalidatePath(`/litters/${litterId}/matching`);
  revalidatePath(`/litters/${litterId}/puppies/${puppyId}`);
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/pipeline");
  revalidatePath("/waitlist");
  revalidatePath("/");
}

/** Offer a puppy to an applicant. The allocations_sync trigger moves the puppy to matched, the application to matched, and logs the timeline entry. */
export async function offerPuppy(litterId: string, puppyId: string, formData: FormData) {
  const applicationId = String(formData.get("application_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!applicationId) return { error: "Pick a family first." };
  const member = await getMember();
  const supabase = await createClient();
  const { error } = await supabase.from("allocations").insert({ breeder_id: member.breederId, puppy_id: puppyId, application_id: applicationId, notes });
  if (error) {
    if (error.code === "23505") return { error: "That puppy or family already has a live offer. Resolve it first." };
    return { error: error.message };
  }
  revalidate(litterId, puppyId, applicationId);
  return { ok: true };
}

export async function setAllocationStatus(allocationId: string, litterId: string, to: AllocationStatus) {
  const supabase = await createClient();
  const { data: current } = await supabase.from("allocations").select("status, puppy_id, application_id").eq("id", allocationId).maybeSingle();
  if (!current) return { error: "Offer not found." };
  if (!TRANSITIONS[current.status as AllocationStatus].includes(to)) return { error: `Can't go from ${current.status} to ${to}.` };
  const { error } = await supabase.from("allocations").update({ status: to }).eq("id", allocationId);
  if (error) return { error: error.message };
  revalidate(litterId, current.puppy_id, current.application_id);
  return { ok: true };
}

export async function updateAllocationNotes(allocationId: string, litterId: string, formData: FormData) {
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const supabase = await createClient();
  const { data: current } = await supabase.from("allocations").select("puppy_id, application_id").eq("id", allocationId).maybeSingle();
  if (!current) return { error: "Offer not found." };
  const { error } = await supabase.from("allocations").update({ notes }).eq("id", allocationId);
  if (error) return { error: error.message };
  revalidate(litterId, current.puppy_id, current.application_id);
  return { ok: true };
}
