"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getMember } from "@/lib/supabase/server";

const dogSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  registered_name: z.string().trim().optional(),
  call_name: z.string().trim().optional(),
  sex: z.enum(["male", "female"]),
  breed_type: z.string().trim().optional(),
  generation: z.string().trim().optional(),
  dob: z.string().optional(),
  colour: z.string().trim().optional(),
  microchip: z.string().trim().optional(),
  sire_id: z.string().uuid().optional().or(z.literal("")),
  dam_id: z.string().uuid().optional().or(z.literal("")),
  is_external: z.string().optional(),
  status: z.enum(["active", "retired", "deceased"]).default("active"),
  notes: z.string().trim().optional(),
});

function toRow(d: z.infer<typeof dogSchema>) {
  return {
    name: d.name,
    registered_name: d.registered_name || null,
    call_name: d.call_name || null,
    sex: d.sex,
    breed_type: d.breed_type || null,
    generation: d.generation || null,
    dob: d.dob || null,
    colour: d.colour || null,
    microchip: d.microchip || null,
    sire_id: d.sire_id || null,
    dam_id: d.dam_id || null,
    is_external: d.is_external === "on",
    status: d.status,
    notes: d.notes || null,
  };
}

export async function createDog(_prev: { error?: string } | undefined, formData: FormData) {
  const parsed = dogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };
  const member = await getMember();
  const supabase = await createClient();
  const { data, error } = await supabase.from("dogs").insert({ breeder_id: member.breederId, ...toRow(parsed.data) }).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/dogs");
  redirect(`/dogs/${data.id}`);
}

export async function updateDog(id: string, formData: FormData) {
  const parsed = dogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };
  const supabase = await createClient();
  const { error } = await supabase.from("dogs").update(toRow(parsed.data)).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dogs");
  revalidatePath(`/dogs/${id}`);
  return { ok: true };
}
