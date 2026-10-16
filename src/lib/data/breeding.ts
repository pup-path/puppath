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
