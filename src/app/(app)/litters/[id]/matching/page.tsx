import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMatching } from "@/lib/data/breeding";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StageBadge } from "@/components/stage-badge";
import { ALLOCATION_META, PUPPY_STATUS_META } from "@/lib/litters";
import { preferenceSummary } from "@/lib/stages";
import { fullName } from "@/lib/utils";
import { fmtDate } from "@/lib/format";
import { AllocationActions, OfferDialog, type Candidate } from "./controls";
import type { AllocationWithApplication, PuppyWithAllocation } from "@/lib/data/breeding";
import type { ApplicationWithPerson } from "@/lib/types";

export const metadata = { title: "Matching" };

export default async function MatchingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMatching(id);
  if (!data) notFound();
  const { litter, puppies, history, candidates } = data;

  const activeByApp = new Map(puppies.filter((p) => p.allocation).map((p) => [p.allocation!.application_id, p]));
  // Families with a live match anywhere (this litter or another) can't be offered a second puppy.
  const busy = new Set(candidates.filter((c) => c.stage === "matched").map((c) => c.id));
  const free = candidates.filter((c) => !busy.has(c.id));

  const matched = puppies.filter((p) => p.status === "matched").length;
  const placed = puppies.filter((p) => p.status === "placed").length;
  const open = puppies.filter((p) => p.status === "available").length;

  return (
    <>
      <Link href={`/litters/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" /> {litter.code}</Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Matching</h1>
        <p className="text-sm text-muted-foreground">
          {puppies.length} puppies · {open} to place · {matched} matched · {placed} gone home · {free.filter((c) => c.stage === "waitlisted").length} waiting
          {litter.go_home_date && <> · go home {fmtDate(litter.go_home_date)}</>}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Puppies */}
        <div className="space-y-3 lg:col-span-3">
          {puppies.length === 0 && <Card><p className="text-sm text-muted-foreground">No puppies yet. Record the birth on the litter page first.</p></Card>}
          {puppies.map((p) => (
            <PuppyRow key={p.id} puppy={p} litterId={id} history={history.filter((h) => h.puppy_id === p.id && h.id !== p.allocation?.id)} candidates={free.map((c) => toCandidate(c, p))} />
          ))}
        </div>

        {/* Families */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Families</CardTitle></CardHeader>
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nobody approved or waitlisted yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {candidates.map((c) => {
                  const pup = activeByApp.get(c.id);
                  return (
                    <li key={c.id} className="py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/applications/${c.id}`} className="block truncate text-sm font-medium text-ink hover:underline">
                            {c.waitlist_position ? <span className="text-muted-foreground">#{c.waitlist_position} </span> : null}{fullName(c.people)}
                          </Link>
                          <div className="truncate text-xs text-muted-foreground">{preferenceSummary(c) || "No preferences given"}</div>
                        </div>
                        {pup ? (
                          <Badge tone={ALLOCATION_META[pup.allocation!.status].tone}>{ALLOCATION_META[pup.allocation!.status].label}: {puppyLabel(pup)}</Badge>
                        ) : c.stage === "matched" ? (
                          <Badge tone="green">Matched elsewhere</Badge>
                        ) : (
                          <StageBadge stage={c.stage} />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">Order is the waitlist order. Approved families without a deposit show too, so you can match early if you need to.</p>
          </Card>
        </div>
      </div>
    </>
  );
}

function puppyLabel(p: PuppyWithAllocation) {
  return p.temp_name ?? (p.collar_colour ? `${p.collar_colour} collar` : "puppy");
}

function toCandidate(c: ApplicationWithPerson, p: PuppyWithAllocation): Candidate {
  const wantsSex = c.preferred_sex && c.preferred_sex !== "any" ? c.preferred_sex : null;
  const colours = (c.preferred_colours ?? []).map((x) => x.toLowerCase());
  const sexFit = wantsSex && p.sex ? (wantsSex === p.sex ? "yes" : "no") : "na";
  const colourFit = colours.length && p.colour ? (colours.some((x) => p.colour!.toLowerCase().includes(x) || x.includes(p.colour!.toLowerCase())) ? "yes" : "no") : "na";
  return {
    id: c.id,
    name: fullName(c.people),
    position: c.waitlist_position,
    stage: c.stage,
    prefs: preferenceSummary(c) || "No preferences given",
    sexFit,
    colourFit,
  };
}

function PuppyRow({ puppy: p, litterId, history, candidates }: { puppy: PuppyWithAllocation; litterId: string; history: AllocationWithApplication[]; candidates: Candidate[] }) {
  const meta = PUPPY_STATUS_META[p.status];
  const a = p.allocation;
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-peach text-xs font-semibold text-ink">{(p.temp_name ?? p.collar_colour ?? "?").slice(0, 6)}</div>
          <div>
            <Link href={`/litters/${litterId}/puppies/${p.id}`} className="font-semibold text-ink hover:underline">{puppyLabel(p)}</Link>
            <div className="text-xs text-muted-foreground">{p.sex === "female" ? "Female" : p.sex === "male" ? "Male" : "Sex tbc"}{p.colour ? ` · ${p.colour}` : ""}</div>
          </div>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>

      {a ? (
        <div className="mt-4 rounded-lg border border-border bg-cream p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm">
              <Link href={`/applications/${a.application_id}`} className="font-medium text-ink hover:underline">{fullName(a.application.people)}</Link>
              <span className="text-muted-foreground"> · {ALLOCATION_META[a.status].label.toLowerCase()} {fmtDate(a.status === "collected" ? a.collected_at : a.responded_at ?? a.offered_at)}</span>
            </div>
            <Badge tone={ALLOCATION_META[a.status].tone}>{ALLOCATION_META[a.status].label}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{ALLOCATION_META[a.status].hint}</p>
          <AllocationActions allocationId={a.id} litterId={litterId} status={a.status} notes={a.notes} family={fullName(a.application.people)} />
        </div>
      ) : p.status === "available" || p.status === "held" ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{p.status === "held" ? "Holding back for now. You can still offer if plans change." : "Not offered to anyone yet."}</span>
          <OfferDialog litterId={litterId} puppyId={p.id} puppyLabel={puppyLabel(p)} candidates={candidates} />
        </div>
      ) : null}

      {history.length > 0 && (
        <details className="mt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer">Earlier offers ({history.length})</summary>
          <ul className="mt-1 space-y-0.5">
            {history.map((h) => (
              <li key={h.id}>{fullName(h.application.people)}: {ALLOCATION_META[h.status].label.toLowerCase()} {fmtDate(h.responded_at ?? h.offered_at)}{h.notes ? ` · ${h.notes}` : ""}</li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
