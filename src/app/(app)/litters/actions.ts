"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addDays, addWeeks, format, parseISO } from "date-fns";
import { createClient, getMember } from "@/lib/supabase/server";
import { GESTATION_DAYS, GO_HOME_WEEKS } from "@/lib/litters";

const litterSchema = z.object({
  code: z.string().trim().min(1, "Give the litter a name"),
  dam_id: z.string().uuid().optional().or(z.literal("")),
  sire_id: z.string().uuid().optional().or(z.literal("")),
  mating_date: z.string().optional(),
  due_date: z.string().optional(),
  whelped_date: z.string().optional(),
  go_home_date: z.string().optional(),
  status: z.enum(["planned", "confirmed", "born", "weaning", "ready", "complete"]).default("planned"),
  expected_count: z.coerce.number().int().min(0).optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

function toRow(d: z.infer<typeof litterSchema>) {
  const mating = d.mating_date || null;
  const due = d.due_date || (mating ? format(addDays(parseISO(mating), GESTATION_DAYS), "yyyy-MM-dd") : null);
  const whelped = d.whelped_date || null;
  const goHome = d.go_home_date || (whelped ? format(addWeeks(parseISO(whelped), GO_HOME_WEEKS), "yyyy-MM-dd") : null);
  return {
    code: d.code,
    dam_id: d.dam_id || null,
    sire_id: d.sire_id || null,
    mating_date: mating,
    due_date: due,
    whelped_date: whelped,
    go_home_date: goHome,
    status: d.status,
    expected_count: d.expected_count === "" || d.expected_count === undefined ? null : d.expected_count,
    notes: d.notes || null,
  };
}

export async function createLitter(_prev: { error?: string } | undefined, formData: FormData) {
  const parsed = litterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };
  const member = await getMember();
  const supabase = await createClient();
  const { data, error } = await supabase.from("litters").insert({ breeder_id: member.breederId, ...toRow(parsed.data) }).select("id").single();
  if (error) return { error: error.code === "23505" ? "A litter with that name already exists." : error.message };
  revalidatePath("/litters");
  redirect(`/litters/${data.id}`);
}

export async function updateLitter(id: string, formData: FormData) {
  const parsed = litterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };
  const supabase = await createClient();
  const { error } = await supabase.from("litters").update(toRow(parsed.data)).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/litters");
  revalidatePath(`/litters/${id}`);
  return { ok: true };
}

export async function setLitterStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("litters").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/litters");
  revalidatePath(`/litters/${id}`);
  return { ok: true };
}

/** Record the birth: whelped date, go-home default, and N blank puppies in one go. */
export async function recordBirth(id: string, formData: FormData) {
  const whelped = String(formData.get("whelped_date") ?? "");
  const females = Number(formData.get("females") ?? 0) || 0;
  const males = Number(formData.get("males") ?? 0) || 0;
  if (!whelped) return { error: "When were they born?" };
  const member = await getMember();
  const supabase = await createClient();
  const { error } = await supabase
    .from("litters")
    .update({ whelped_date: whelped, go_home_date: format(addWeeks(parseISO(whelped), GO_HOME_WEEKS), "yyyy-MM-dd"), status: "born" })
    .eq("id", id);
  if (error) return { error: error.message };
  const rows = [
    ...Array.from({ length: females }, () => ({ breeder_id: member.breederId, litter_id: id, sex: "female" as const })),
    ...Array.from({ length: males }, () => ({ breeder_id: member.breederId, litter_id: id, sex: "male" as const })),
  ];
  if (rows.length) {
    const { error: pErr } = await supabase.from("puppies").insert(rows);
    if (pErr) return { error: pErr.message };
  }
  revalidatePath(`/litters/${id}`);
  revalidatePath("/litters");
  return { ok: true };
}

const puppySchema = z.object({
  collar_colour: z.string().trim().optional(),
  temp_name: z.string().trim().optional(),
  sex: z.enum(["male", "female"]).optional().or(z.literal("")),
  colour: z.string().trim().optional(),
  birth_weight_g: z.coerce.number().int().min(0).optional().or(z.literal("")),
  microchip: z.string().trim().optional(),
  status: z.enum(["available", "held", "matched", "placed", "deceased"]).optional(),
  temperament_notes: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function addPuppy(litterId: string, formData: FormData) {
  const parsed = puppySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };
  const d = parsed.data;
  const member = await getMember();
  const supabase = await createClient();
  const { error } = await supabase.from("puppies").insert({
    breeder_id: member.breederId,
    litter_id: litterId,
    collar_colour: d.collar_colour || null,
    temp_name: d.temp_name || null,
    sex: d.sex || null,
    colour: d.colour || null,
    birth_weight_g: d.birth_weight_g === "" || d.birth_weight_g === undefined ? null : d.birth_weight_g,
  });
  if (error) return { error: error.message };
  revalidatePath(`/litters/${litterId}`);
  return { ok: true };
}

export async function updatePuppy(puppyId: string, litterId: string, formData: FormData) {
  const parsed = puppySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };
  const d = parsed.data;
  const supabase = await createClient();
  const patch: Record<string, unknown> = {
    collar_colour: d.collar_colour || null,
    temp_name: d.temp_name || null,
    sex: d.sex || null,
    colour: d.colour || null,
    birth_weight_g: d.birth_weight_g === "" || d.birth_weight_g === undefined ? null : d.birth_weight_g,
    microchip: d.microchip || null,
    temperament_notes: d.temperament_notes || null,
    notes: d.notes || null,
  };
  // Only held/available can be set by hand; matched/placed are driven by allocations.
  if (d.status === "held" || d.status === "available" || d.status === "deceased") patch.status = d.status;
  const { error } = await supabase.from("puppies").update(patch).eq("id", puppyId);
  if (error) return { error: error.message };
  revalidatePath(`/litters/${litterId}`);
  revalidatePath(`/litters/${litterId}/puppies/${puppyId}`);
  return { ok: true };
}

export async function deletePuppy(puppyId: string, litterId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("puppies").delete().eq("id", puppyId);
  if (error) return { error: error.message };
  revalidatePath(`/litters/${litterId}`);
  redirect(`/litters/${litterId}`);
}

export async function addWeight(puppyId: string, litterId: string, formData: FormData) {
  const grams = Number(formData.get("weight_g"));
  const on = String(formData.get("recorded_on") ?? "") || format(new Date(), "yyyy-MM-dd");
  if (!Number.isFinite(grams) || grams <= 0) return { error: "Weight in grams, please." };
  const member = await getMember();
  const supabase = await createClient();
  const { error } = await supabase.from("puppy_weights").insert({ breeder_id: member.breederId, puppy_id: puppyId, recorded_on: on, weight_g: Math.round(grams) });
  if (error) return { error: error.message };
  revalidatePath(`/litters/${litterId}`);
  revalidatePath(`/litters/${litterId}/puppies/${puppyId}`);
  return { ok: true };
}

export async function deleteWeight(weightId: string, litterId: string, puppyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("puppy_weights").delete().eq("id", weightId);
  if (error) return { error: error.message };
  revalidatePath(`/litters/${litterId}/puppies/${puppyId}`);
  return { ok: true };
}
