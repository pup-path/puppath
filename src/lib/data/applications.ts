import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Activity, ApplicationStage, ApplicationWithPerson, Person } from "@/lib/types";
import { EXIT_STAGES } from "@/lib/stages";

export interface ApplicationCard extends ApplicationWithPerson {
  last_activity_at: string | null;
  last_activity_body: string | null;
}

export async function listApplications(opts: { includeClosed?: boolean; stages?: ApplicationStage[] } = {}): Promise<ApplicationCard[]> {
  const supabase = await createClient();
  let q = supabase.from("applications").select("*, people(*)").order("created_at", { ascending: false });
  if (opts.stages?.length) q = q.in("stage", opts.stages);
  else if (!opts.includeClosed) q = q.not("stage", "in", `(${EXIT_STAGES.filter((s) => s !== "on_hold").join(",")})`);
  const { data, error } = await q;
  if (error) throw error;
  const apps = (data ?? []) as ApplicationWithPerson[];
  if (apps.length === 0) return [];

  const { data: acts } = await supabase
    .from("activities")
    .select("application_id, occurred_at, body, type")
    .in("application_id", apps.map((a) => a.id))
    .neq("type", "system")
    .order("occurred_at", { ascending: false });

  const latest = new Map<string, { occurred_at: string; body: string | null }>();
  for (const a of acts ?? []) {
    if (a.application_id && !latest.has(a.application_id)) latest.set(a.application_id, a);
  }
  return apps.map((a) => ({
    ...a,
    last_activity_at: latest.get(a.id)?.occurred_at ?? a.created_at,
    last_activity_body: latest.get(a.id)?.body ?? null,
  }));
}

export async function getApplication(id: string) {
  const supabase = await createClient();
  const [{ data: app, error }, { data: activities }] = await Promise.all([
    supabase.from("applications").select("*, people(*)").eq("id", id).maybeSingle(),
    supabase.from("activities").select("*").eq("application_id", id).order("occurred_at", { ascending: false }).order("created_at", { ascending: false }),
  ]);
  if (error) throw error;
  if (!app) return null;
  return { application: app as ApplicationWithPerson, activities: (activities ?? []) as Activity[] };
}

export async function listPeople(): Promise<(Person & { applications: { id: string; stage: ApplicationStage; created_at: string }[] })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("*, applications(id, stage, created_at)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}

export async function stageCounts() {
  const supabase = await createClient();
  const { data } = await supabase.from("applications").select("stage");
  const counts: Partial<Record<ApplicationStage, number>> = {};
  for (const r of data ?? []) counts[r.stage as ApplicationStage] = (counts[r.stage as ApplicationStage] ?? 0) + 1;
  return counts;
}
