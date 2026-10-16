import type { ApplicationStage, ActivityChannel, ActivityType, PersonSource, SexPreference, TimingPreference } from "./types";
import type { BadgeTone } from "@/components/ui/badge";

export const FORWARD_STAGES: ApplicationStage[] = [
  "enquiry", "applied", "reviewing", "approved", "waitlisted", "matched", "placed",
];
export const EXIT_STAGES: ApplicationStage[] = ["on_hold", "declined", "withdrawn"];
export const ALL_STAGES: ApplicationStage[] = [...FORWARD_STAGES, ...EXIT_STAGES];

export const STAGE_META: Record<ApplicationStage, { label: string; short: string; tone: BadgeTone; hint: string }> = {
  enquiry:    { label: "Enquiry",     short: "Enquiry",   tone: "gray",   hint: "Said hello. Not yet applied." },
  applied:    { label: "Applied",     short: "Applied",   tone: "blue",   hint: "Application form in. Needs a look." },
  reviewing:  { label: "Reviewing",   short: "Review",    tone: "blue",   hint: "Being assessed, questions going back and forth." },
  approved:   { label: "Approved",    short: "Approved",  tone: "yellow", hint: "Yes from Jen. Deposit requested, not yet received." },
  waitlisted: { label: "Waitlisted",  short: "Waitlist",  tone: "brand",  hint: "Deposit in. In the queue for a puppy." },
  matched:    { label: "Matched",     short: "Matched",   tone: "green",  hint: "A puppy has been offered or accepted." },
  placed:     { label: "Placed",      short: "Placed",    tone: "green",  hint: "Puppy collected. Now an owner." },
  on_hold:    { label: "On hold",     short: "Hold",      tone: "gray",   hint: "Paused by the applicant or by Jen." },
  declined:   { label: "Declined",    short: "Declined",  tone: "red",    hint: "Not a fit." },
  withdrawn:  { label: "Withdrawn",   short: "Withdrawn", tone: "red",    hint: "They pulled out." },
};

export const SOURCE_LABEL: Record<PersonSource, string> = {
  website: "Website", instagram: "Instagram", facebook: "Facebook", referral: "Referral", whatsapp: "WhatsApp", other: "Other",
};

export const SEX_LABEL: Record<SexPreference, string> = { male: "Male", female: "Female", any: "Either" };

export const TIMING_LABEL: Record<TimingPreference, string> = {
  asap: "As soon as possible", next_litter: "Next litter", flexible: "Flexible", specific: "Specific timing",
};

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "message", label: "Message" },
  { value: "call", label: "Phone call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting / visit" },
];

export const CHANNEL_LABEL: Record<ActivityChannel, string> = {
  whatsapp: "WhatsApp", email: "Email", sms: "SMS", phone: "Phone", in_person: "In person", web: "Website",
};

export function preferenceSummary(a: { preferred_sex: SexPreference | null; preferred_colours: string[]; preferred_generation: string | null; timing: TimingPreference | null }) {
  const parts: string[] = [];
  if (a.preferred_sex && a.preferred_sex !== "any") parts.push(SEX_LABEL[a.preferred_sex]);
  if (a.preferred_colours?.length) parts.push(a.preferred_colours.join("/"));
  if (a.preferred_generation) parts.push(a.preferred_generation);
  if (a.timing && a.timing !== "flexible") parts.push(TIMING_LABEL[a.timing].toLowerCase());
  return parts.length ? parts.join(" · ") : "No preferences recorded";
}
