import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Allocation, ApplicationWithPerson, Dog, Litter, Puppy } from "@/lib/types";

export async function listDogs() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("dogs").select("*").order("status").order("name");
  if (error) throw error;
  return (data ?? []) as Dog[];
}

export async function getDog(id: string) {
  const supabase = await createClient();
  const [{ data: dog }, { data: litters }, { data: parents }] = await Promise.all([
    supabase.from("dogs").select("*").eq("id", id).maybeSingle(),
    supabase.from("litters").select("*, puppies(id, sex)").or(`dam_id.eq.${id},sire_id.eq.${id}`).order("mating_date", { ascending: false }),
    supabase.from("dogs").select("id, name, sex"),
  ]);
  if (!dog) return null;
  const nameById = new Map((parents ?? []).map((p) => [p.id as string, p.name as string]));
  return {
    dog: dog as Dog,
    litters: (litters ?? []) as (Litter & { puppies: { id: string; sex: string | null }[] })[],
    nameById,
  };
}

export interface LitterCard extends Litter {
  dam: { id: string; name: string } | null;
  sire: { id: string; name: string } | null;
  puppies: { id: string; status: string; sex: string | null }[];
}

export async function listLitters() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("litters")
    .select("*, dam:dogs!litters_dam_id_fkey(id, name), sire:dogs!litters_sire_id_fkey(id, name), puppies(id, status, sex)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as LitterCard[];
}

export interface PuppyWithAllocation extends Puppy {
  allocation: (Allocation & { application: ApplicationWithPerson }) | null;
  weights: { id: string; recorded_on: string; weight_g: number }[];
}

export async function getLitter(id: string) {
  const supabase = await createClient();
  const [{ data: litter }, { data: puppies }, { data: allocations }, { data: weights }] = await Promise.all([
    supabase.from("litters").select("*, dam:dogs!litters_dam_id_fkey(id, name, colour), sire:dogs!litters_sire_id_fkey(id, name, colour)").eq("id", id).maybeSingle(),
    supabase.from("puppies").select("*").eq("litter_id", id).order("created_at"),
    supabase.from("allocations").select("*, application:applications(*, people(*))").in("status", ["offered", "accepted", "confirmed", "collected"]),
    supabase.from("puppy_weights").select("id, puppy_id, recorded_on, weight_g").order("recorded_on"),
  ]);
  if (!litter) return null;

  const pups = (puppies ?? []) as Puppy[];
  const pupIds = new Set(pups.map((p) => p.id));
  const allocByPuppy = new Map<string, PuppyWithAllocation["allocation"]>();
  for (const a of (allocations ?? []) as unknown as (Allocation & { application: ApplicationWithPerson })[]) {
    if (pupIds.has(a.puppy_id)) allocByPuppy.set(a.puppy_id, a);
  }
  const weightsByPuppy = new Map<string, PuppyWithAllocation["weights"]>();
  for (const w of weights ?? []) {
    if (!pupIds.has(w.puppy_id)) continue;
    const arr = weightsByPuppy.get(w.puppy_id) ?? [];
    arr.push({ id: w.id, recorded_on: w.recorded_on, weight_g: w.weight_g });
    weightsByPuppy.set(w.puppy_id, arr);
  }

  return {
    litter: litter as unknown as Litter & { dam: { id: string; name: string; colour: string | null } | null; sire: { id: string; name: string; colour: string | null } | null },
    puppies: pups.map((p) => ({ ...p, allocation: allocByPuppy.get(p.id) ?? null, weights: weightsByPuppy.get(p.id) ?? [] })) as PuppyWithAllocation[],
  };
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

export type AllocationWithApplication = Allocation & { application: ApplicationWithPerson };

/** Everything the matching page needs: the litter, its puppies, every allocation ever made on them, and who could still be offered a puppy. */
export async function getMatching(litterId: string) {
  const base = await getLitter(litterId);
  if (!base) return null;
  const supabase = await createClient();
  const pupIds = base.puppies.map((p) => p.id);
  const [{ data: allocations }, { data: candidates }] = await Promise.all([
    pupIds.length
      ? supabase.from("allocations").select("*, application:applications(*, people(*))").in("puppy_id", pupIds).order("offered_at", { ascending: false })
      : Promise.resolve({ data: [] as unknown[] }),
    supabase.from("applications").select("*, people(*)").in("stage", ["waitlisted", "approved", "matched"]).order("waitlist_position", { ascending: true, nullsFirst: false }),
  ]);
  return {
    ...base,
    history: (allocations ?? []) as AllocationWithApplication[],
    candidates: (candidates ?? []) as ApplicationWithPerson[],
  };
}

export type AllocationWithPuppy = Allocation & { puppy: Puppy & { litter: { id: string; code: string; go_home_date: string | null } } };

/** Allocations for one application, newest first, with the puppy and litter. */
export async function listAllocationsForApplication(applicationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("allocations")
    .select("*, puppy:puppies(*, litter:litters(id, code, go_home_date))")
    .eq("application_id", applicationId)
    .order("offered_at", { ascending: false });
  return (data ?? []) as unknown as AllocationWithPuppy[];
}

/** Open offers nobody has answered yet, for the home page. */
export async function listOpenOffers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("allocations")
    .select("id, status, offered_at, application:applications(id, people(first_name, last_name)), puppy:puppies(id, temp_name, collar_colour, litter:litters(id, code))")
    .in("status", ["offered", "accepted"])
    .order("offered_at");
  return (data ?? []) as unknown as {
    id: string; status: "offered" | "accepted"; offered_at: string;
    application: { id: string; people: { first_name: string; last_name: string | null } };
    puppy: { id: string; temp_name: string | null; collar_colour: string | null; litter: { id: string; code: string } };
  }[];
}
