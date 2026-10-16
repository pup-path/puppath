"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAnonClient } from "@/lib/supabase/anon";
import { sendEmail, notifyBreeder, enquiryConfirmation, applicationConfirmation } from "@/lib/email";
import { APPLICATION_STEPS, CONTACT_KEYS, TYPED_KEYS } from "@/lib/application-form";

const BREEDER_SLUG = process.env.PUPPATH_BREEDER_SLUG ?? "nbg";

export type PublicFormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

/** Cloudflare Turnstile check. Skipped when the secret isn't configured. */
async function verifyTurnstile(token: FormDataEntryValue | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: String(token), ...(ip ? { remoteip: ip } : {}) }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return !!data.success;
}

const enquirySchema = z.object({
  first_name: z.string().trim().min(1, "Your first name, please."),
  last_name: z.string().trim().optional(),
  email: z.string().trim().email("That email doesn't look right."),
  phone: z.string().trim().optional(),
  suburb: z.string().trim().optional(),
  source: z.enum(["website", "instagram", "facebook", "referral", "whatsapp", "other"]).default("website"),
  message: z.string().trim().min(1, "Tell us a little about what you're looking for."),
});

export async function submitEnquiry(_prev: PublicFormState, formData: FormData): Promise<PublicFormState> {
  // Honeypot: real people never fill this.
  if (formData.get("website_url")) return { ok: true };
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) return { error: "We couldn't confirm you're a person. Refresh and try again." };

  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] = i.message;
    return { error: "A couple of things need fixing.", fieldErrors };
  }
  const d = parsed.data;

  const supabase = createAnonClient();
  const { error } = await supabase.rpc("submit_enquiry", {
    breeder_slug: BREEDER_SLUG,
    first_name: d.first_name,
    last_name: d.last_name ?? null,
    email: d.email,
    phone: d.phone ?? null,
    suburb: d.suburb ?? null,
    source: d.source,
    message: d.message,
  });
  if (error) {
    console.error("submit_enquiry failed", error);
    return { error: "Something went wrong on our side. Please try again, or message Jen directly." };
  }

  const mail = enquiryConfirmation(d.first_name);
  await Promise.all([
    sendEmail({ to: d.email, ...mail }),
    notifyBreeder(`New enquiry: ${d.first_name} ${d.last_name ?? ""}`.trim(), `${d.first_name} ${d.last_name ?? ""} (${d.email}${d.phone ? ", " + d.phone : ""}${d.suburb ? ", " + d.suburb : ""})\n\n${d.message}\n\nOpen the pipeline: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/pipeline`),
  ]);
  return { ok: true };
}

export async function submitApplication(_prev: PublicFormState, formData: FormData): Promise<PublicFormState> {
  if (formData.get("website_url")) return { ok: true };
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) return { error: "We couldn't confirm you're a person. Refresh and try again." };

  // Validate required questions from the form definition.
  const fieldErrors: Record<string, string> = {};
  const contact: Record<string, string> = {};
  const home: Record<string, string> = {};
  const answers: Record<string, string> = {};
  const typed: Record<string, string | string[]> = {};

  for (const step of APPLICATION_STEPS) {
    for (const q of step.questions) {
      const raw = q.type === "multi" ? formData.getAll(q.key).map(String).filter(Boolean) : String(formData.get(q.key) ?? "").trim();
      const empty = Array.isArray(raw) ? raw.length === 0 : raw.length === 0;
      if ("required" in q && q.required && empty) fieldErrors[q.key] = "Required";
      if (empty) continue;
      const label = q.type === "select" || q.type === "multi" ? labelFor(q, raw) : raw;
      if ((CONTACT_KEYS as readonly string[]).includes(q.key)) contact[q.key] = String(raw);
      else if ((TYPED_KEYS as readonly string[]).includes(q.key)) typed[q.key] = raw;
      else if (step.bucket === "home") home[q.label] = Array.isArray(label) ? label.join(", ") : label;
      else answers[q.label] = Array.isArray(label) ? label.join(", ") : label;
    }
  }
  if (contact.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email)) fieldErrors.email = "That email doesn't look right.";
  if (Object.keys(fieldErrors).length) return { error: "A few required answers are missing.", fieldErrors };

  const supabase = createAnonClient();
  const { error } = await supabase.rpc("submit_application", {
    breeder_slug: BREEDER_SLUG,
    first_name: contact.first_name,
    last_name: contact.last_name ?? null,
    email: contact.email,
    phone: contact.phone ?? null,
    suburb: contact.suburb ?? null,
    state: contact.state ?? null,
    postcode: contact.postcode ?? null,
    source: contact.source ?? "website",
    preferred_sex: (typed.preferred_sex as string) ?? "any",
    preferred_colours: Array.isArray(typed.preferred_colours) ? typed.preferred_colours : [],
    preferred_generation: (typed.preferred_generation as string) ?? null,
    timing: (typed.timing as string) ?? "flexible",
    timing_note: (typed.timing_note as string) ?? null,
    home,
    answers,
  });
  if (error) {
    console.error("submit_application failed", error);
    return { error: "Something went wrong on our side. Please try again, or message Jen directly." };
  }

  const mail = applicationConfirmation(contact.first_name);
  await Promise.all([
    sendEmail({ to: contact.email, ...mail }),
    notifyBreeder(`New application: ${contact.first_name} ${contact.last_name ?? ""}`.trim(), `${contact.first_name} ${contact.last_name ?? ""} (${contact.email}) has submitted the full application.\n\nOpen the pipeline: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/pipeline`),
  ]);
  return { ok: true };
}

function labelFor(q: { options?: { value: string; label: string }[] }, raw: string | string[]) {
  const map = new Map((q.options ?? []).map((o) => [o.value, o.label]));
  return Array.isArray(raw) ? raw.map((v) => map.get(v) ?? v) : (map.get(raw) ?? raw);
}
