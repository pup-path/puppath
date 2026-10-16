import Link from "next/link";
import { listApplications } from "@/lib/data/applications";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEX_LABEL, TIMING_LABEL } from "@/lib/stages";
import { fmtDate, aud, daysSince } from "@/lib/format";
import { fullName } from "@/lib/utils";
import { MoveButtons, CompactButton } from "./controls";
import type { SexPreference } from "@/lib/types";

export const metadata = { title: "Waitlist" };

export default async function WaitlistPage({ searchParams }: { searchParams: Promise<{ sex?: string; colour?: string }> }) {
  const { sex, colour } = await searchParams;
  const all = (await listApplications({ stages: ["waitlisted"] })).sort((a, b) => (a.waitlist_position ?? 999) - (b.waitlist_position ?? 999));

  const colours = [...new Set(all.flatMap((a) => a.preferred_colours ?? []))].sort();
  const filtered = all.filter((a) => {
    if (sex && sex !== "all" && a.preferred_sex !== sex && a.preferred_sex !== "any") return false;
    if (colour && colour !== "all" && !(a.preferred_colours ?? []).includes(colour) && !(a.preferred_colours ?? []).includes("any")) return false;
    return true;
  });
  const hasGaps = all.some((a, i) => a.waitlist_position !== i + 1);

  const link = (p: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { sex, colour, ...p };
    for (const [k, v] of Object.entries(merged)) if (v && v !== "all") sp.set(k, v);
    const q = sp.toString();
    return `/waitlist${q ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Waitlist" description={`${all.length} ${all.length === 1 ? "family" : "families"} with a deposit in, in order.`}>
        {hasGaps && <CompactButton />}
      </PageHeader>

      {all.length === 0 ? (
        <EmptyState title="Nobody on the waitlist yet" body="People arrive here when you approve them and record their deposit on the application page.">
          <Button asChild variant="outline"><Link href="/pipeline">Open the pipeline</Link></Button>
        </EmptyState>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Wants:</span>
            {(["all", "female", "male"] as const).map((s) => (
              <Link key={s} href={link({ sex: s })} className={`rounded-full border px-3 py-1 ${(sex ?? "all") === s ? "border-sun bg-sun-soft text-orange-800" : "border-border bg-white text-muted-foreground"}`}>
                {s === "all" ? "Any" : SEX_LABEL[s]}
              </Link>
            ))}
            {colours.length > 0 && (
              <>
                <span className="ml-3 text-muted-foreground">Colour:</span>
                <Link href={link({ colour: "all" })} className={`rounded-full border px-3 py-1 ${!colour ? "border-sun bg-sun-soft text-orange-800" : "border-border bg-white text-muted-foreground"}`}>Any</Link>
                {colours.map((c) => (
                  <Link key={c} href={link({ colour: c })} className={`rounded-full border px-3 py-1 capitalize ${colour === c ? "border-sun bg-sun-soft text-orange-800" : "border-border bg-white text-muted-foreground"}`}>{c}</Link>
                ))}
              </>
            )}
            {(sex || colour) && <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {all.length} match</span>}
          </div>

          <ol className="space-y-2">
            {filtered.map((a) => {
              const waiting = daysSince(a.deposit_received_at ?? a.approved_at ?? a.created_at);
              return (
                <li key={a.id} className="flex items-start gap-3 rounded-xl border border-border/70 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sun-soft text-sm font-bold text-orange-800">
                    {a.waitlist_position ?? "–"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link href={`/applications/${a.id}`} className="font-semibold text-ink hover:underline">{fullName(a.people)}</Link>
                      {a.people.suburb && <span className="text-xs text-muted-foreground">{a.people.suburb}</span>}
                      <span className="text-xs text-muted-foreground">waiting {waiting} {waiting === 1 ? "day" : "days"}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone="plum">{SEX_LABEL[(a.preferred_sex ?? "any") as SexPreference]}</Badge>
                      {(a.preferred_colours ?? []).map((c) => (
                        <Badge key={c} tone="brand" className="capitalize">{c}</Badge>
                      ))}
                      {a.preferred_generation && <Badge>{a.preferred_generation}</Badge>}
                      {a.timing && a.timing !== "flexible" && <Badge tone="yellow">{TIMING_LABEL[a.timing]}</Badge>}
                      {a.timing_note && <span className="text-xs text-muted-foreground">{a.timing_note}</span>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                      {a.deposit_received_at && <span>Deposit {a.deposit_amount ? aud(a.deposit_amount) : ""} on {fmtDate(a.deposit_received_at)}</span>}
                      {a.internal_rating && <span>Fit {a.internal_rating}/5</span>}
                      {a.internal_notes && <span className="truncate italic">{a.internal_notes}</span>}
                    </div>
                  </div>
                  {!sex && !colour && <MoveButtons id={a.id} first={a.waitlist_position === 1} last={a.waitlist_position === all.length} />}
                </li>
              );
            })}
          </ol>
          {(sex || colour) && <p className="mt-3 text-xs text-muted-foreground">Clear the filters to reorder.</p>}
        </>
      )}
    </>
  );
}
