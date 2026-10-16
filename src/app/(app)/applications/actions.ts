"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getMember } from "@/lib/supabase/server";
import { ALL_STAGES } from "@/lib/stages";
import type { ApplicationStage } from "@/lib/types";

const stageSchema = z.enum(ALL_STAGES as [ApplicationStage, ...ApplicationStage[]]);

function revalidateAll(id?: string) {
  revalidatePath("/pipeline");
  revalidatePath("/waitlist");
  revalidatePath("/people");
  revalidatePath("/");
  if (id) revalidatePath(`/applications/${id}`);
}

export async function setStage(id: string, stage: ApplicationStage, reason?: string) {
  const parsed = stageSchema.parse(stage);
  const supabase = await createClient();
  const patch: Record<string, unknown> = { stage: parsed };
  if (parsed === "declined" || parsed === "withdrawn") patch.close_reason = reason?.trim() || null;
  const { error } = await supabase.from("applications").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidateAll(id);
  return { ok: true };
}

export async function recordDeposit(id: string, formData: FormData) {
  const amount = Number(formData.get("amount"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({ deposit_received_at: new Date().toISOString(), deposit_amount: Number.isFinite(amount) && amount > 0 ? amount : null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll(id);
  return { ok: true };
}

const activitySchema = z.object({
  type: z.enum(["note", "message", "call", "email", "meeting"]),
  direction: z.enum(["in", "out"]).optional().nullable(),
  channel: z.enum(["whatsapp", "email", "sms", "phone", "in_person", "web"]).optional().nullable(),
  body: z.string().trim().min(1, "Write something first."),
  occurred_at: z.string().optional(),
});

export async function addActivity(applicationId: string, personId: string, formData: FormData) {
  const raw = {
    type: formData.get("type"),
    direction: formData.get("direction") || null,
    channel: formData.get("channel") || null,
    body: formData.get("body"),
    occurred_at: formData.get("occurred_at") || undefined,
  };
  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };

  const member = await getMember();
  const supabase = await createClient();
  const { error } = await supabase.from("activities").insert({
    breeder_id: member.breederId,
    person_id: personId,
    application_id: applicationId,
    type: parsed.data.type,
    direction: parsed.data.type === "note" ? null : parsed.data.direction,
    channel: parsed.data.type === "note" ? null : parsed.data.channel,
    body: parsed.data.body,
    occurred_at: parsed.data.occurred_at ? new Date(parsed.data.occurred_at).toISOString() : new Date().toISOString(),
    created_by: member.userId,
  });
  if (error) return { error: error.message };
  revalidateAll(applicationId);
  return { ok: true };
}

const notesSchema = z.object({
  internal_rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  preferred_sex: z.enum(["male", "female", "any"]).optional().nullable(),
  preferred_colours: z.string().optional(),
  preferred_generation: z.string().optional().nullable(),
  timing: z.enum(["asap", "next_litter", "flexible", "specific"]).optional().nullable(),
  timing_note: z.string().optional().nullable(),
});

export async function updateAssessment(id: string, formData: FormData) {
  const ratingRaw = formData.get("internal_rating");
  const parsed = notesSchema.safeParse({
    internal_rating: ratingRaw ? Number(ratingRaw) : null,
    internal_notes: formData.get("internal_notes"),
    preferred_sex: formData.get("preferred_sex") || null,
    preferred_colours: formData.get("preferred_colours") ?? "",
    preferred_generation: formData.get("preferred_generation") || null,
    timing: formData.get("timing") || null,
    timing_note: formData.get("timing_note") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({
      internal_rating: d.internal_rating ?? null,
      internal_notes: d.internal_notes?.trim() || null,
      preferred_sex: d.preferred_sex ?? "any",
      preferred_colours: (d.preferred_colours ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      preferred_generation: d.preferred_generation?.trim() || null,
      timing: d.timing ?? "flexible",
      timing_note: d.timing_note?.trim() || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll(id);
  return { ok: true };
}

const personSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")).optional(),
  phone: z.string().trim().optional(),
  suburb: z.string().trim().optional(),
  source: z.enum(["website", "instagram", "facebook", "referral", "whatsapp", "other"]).optional().nullable(),
  referred_by: z.string().trim().optional(),
  message: z.string().trim().optional(),
  stage: stageSchema.default("enquiry"),
});

export async function createEnquiry(_prev: { error?: string } | undefined, formData: FormData) {
  const parsed = personSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    suburb: formData.get("suburb") ?? "",
    source: formData.get("source") || null,
    referred_by: formData.get("referred_by") ?? "",
    message: formData.get("message") ?? "",
    stage: formData.get("stage") || "enquiry",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid" };
  const d = parsed.data;
  const member = await getMember();
  const supabase = await createClient();

  // Reuse the person if the email is already known.
  let personId: string | null = null;
  if (d.email) {
    const { data: existing } = await supabase.from("people").select("id").ilike("email", d.email).maybeSingle();
    personId = existing?.id ?? null;
  }
  if (!personId) {
    const { data: person, error } = await supabase
      .from("people")
      .insert({
        breeder_id: member.breederId,
        first_name: d.first_name,
        last_name: d.last_name || null,
        email: d.email || null,
        phone: d.phone || null,
        suburb: d.suburb || null,
        source: d.source ?? null,
        referred_by: d.referred_by || null,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    personId = person.id;
  }

  const { data: app, error } = await supabase
    .from("applications")
    .insert({ breeder_id: member.breederId, person_id: personId, stage: d.stage, enquiry_message: d.message || null, submitted_at: d.stage === "enquiry" ? null : new Date().toISOString() })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (d.message) {
    await supabase.from("activities").insert({
      breeder_id: member.breederId,
      person_id: personId,
      application_id: app.id,
      type: "message",
      direction: "in",
      channel: d.source === "whatsapp" ? "whatsapp" : d.source === "website" ? "web" : null,
      body: d.message,
      created_by: member.userId,
    });
  }
  revalidateAll(app.id);
  redirect(`/applications/${app.id}`);
}

export async function updatePerson(personId: string, applicationId: string, formData: FormData) {
  const supabase = await createClient();
  const patch = {
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    suburb: String(formData.get("suburb") ?? "").trim() || null,
    state: String(formData.get("state") ?? "").trim() || null,
    postcode: String(formData.get("postcode") ?? "").trim() || null,
    source: (formData.get("source") as string) || null,
    referred_by: String(formData.get("referred_by") ?? "").trim() || null,
  };
  if (!patch.first_name) return { error: "First name is required" };
  const { error } = await supabase.from("people").update(patch).eq("id", personId);
  if (error) return { error: error.message };
  revalidateAll(applicationId);
  return { ok: true };
}
