import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getLitter, listDogs } from "@/lib/data/breeding";
import { listApplications } from "@/lib/data/applications";
import { listMedia } from "@/lib/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoUpload } from "@/components/photo-upload";
import { LitterForm } from "../litter-form";
import { LitterStatusMenu, RecordBirth, AddPuppy } from "./controls";
import { PhotoGrid } from "./photo-grid";
import { LITTER_STATUSES, LITTER_STATUS_META, PUPPY_STATUS_META } from "@/lib/litters";
import { fmtDate, daysSince } from "@/lib/format";
import { fullName, cn } from "@/lib/utils";
import { preferenceSummary } from "@/lib/stages";
import { differenceInCalendarWeeks, parseISO } from "date-fns";

export default async function LitterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getLitter(id);
  if (!result) notFound();
  const { litter, puppies } = result;
  const [dogs, waitlist, photos] = await Promise.all([listDogs(), listApplications({ stages: ["waitlisted", "matched"] }), listMedia("litter", id)]);

  const stageIdx = LITTER_STATUSES.indexOf(litter.status);
  const weeks = litter.whelped_date ? differenceInCalendarWeeks(new Date(), parseISO(litter.whelped_date)) : null;
  const matchedIds = new Set(puppies.map((p) => p.allocation?.application_id).filter(Boolean));
  const linked = waitlist
    .filter((a) => a.stage === "waitlisted" || matchedIds.has(a.id))
    .sort((a, b) => (a.waitlist_position ?? 999) - (b.waitlist_position ?? 999));
  const f = puppies.filter((p) => p.sex === "female").length;
  const m = puppies.filter((p) => p.sex === "male").length;

  const keyDates: { label: string; date: string | null; note: string; done: boolean }[] = [
    { label: "Mating", date: litter.mating_date, note: "", done: !!litter.mating_date },
    { label: litter.whelped_date ? "Born" : "Due", date: litter.whelped_date ?? litter.due_date, note: litter.whelped_date ? `${puppies.length} puppies` : "63 days from mating", done: !!litter.whelped_date },
    { label: "Matching", date: null, note: weeks !== null ? (weeks >= 3 ? "Now" : `From week 3 (${3 - weeks} to go)`) : "Week 3 to 4", done: matchedIds.size > 0 && matchedIds.size >= puppies.filter((p) => p.status !== "held").length && puppies.length > 0 },
    { label: "Go home", date: litter.go_home_date, note: "Week 8", done: litter.status === "complete" },
  ];

  return (
    <>
      <Link href="/litters" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" /> Litters</Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{litter.code}</h1>
          <p className="text-sm text-muted-foreground">
            {litter.dam ? <Link href={`/dogs/${litter.dam.id}`} className="hover:underline">{litter.dam.name}</Link> : "?"} × {litter.sire ? <Link href={`/dogs/${litter.sire.id}`} className="hover:underline">{litter.sire.name}</Link> : "?"}
            {weeks !== null && litter.status !== "complete" && <> · week {weeks}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={LITTER_STATUS_META[litter.status].tone}>{LITTER_STATUS_META[litter.status].label}</Badge>
          <LitterStatusMenu id={litter.id} status={litter.status} />
        </div>
      </div>

      {/* Progress strip, per wireframe */}
      <Card className="mb-6">
        <ol className="flex items-center justify-between gap-2">
          {LITTER_STATUSES.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col items-center gap-2 text-center">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold", i < stageIdx ? "bg-green-500 text-white" : i === stageIdx ? "bg-sun text-white" : "bg-muted text-muted-foreground")}>
                {i < stageIdx ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-[11px] leading-tight", i === stageIdx ? "font-semibold text-ink" : "text-muted-foreground")}>{LITTER_STATUS_META[s].label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-center text-xs text-muted-foreground">{LITTER_STATUS_META[litter.status].hint}</p>
      </Card>

      {!litter.whelped_date && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50">
          <CardHeader className="mb-2"><CardTitle>Puppies arrived?</CardTitle></CardHeader>
          <p className="mb-3 text-sm text-yellow-900">Record the birth and PupPath creates a card per puppy and sets the go-home date to eight weeks out.</p>
          <RecordBirth id={litter.id} />
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Puppies */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Puppies {puppies.length > 0 && <span className="font-normal text-muted-foreground">({puppies.length}: {f}F, {m}M)</span>}</CardTitle>
            <AddPuppy litterId={litter.id} />
          </CardHeader>
          {puppies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No puppies yet. Record the birth above, or add them one at a time.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {puppies.map((p) => {
                const meta = PUPPY_STATUS_META[p.status];
                const last = p.weights[p.weights.length - 1];
                return (
                  <Link key={p.id} href={`/litters/${litter.id}/puppies/${p.id}`} className="rounded-xl border border-border bg-cream p-3 text-center transition-shadow hover:shadow-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-peach text-xs font-semibold text-ink" style={collarStyle(p.collar_colour)}>
                      {(p.temp_name ?? p.collar_colour ?? "?").slice(0, 8)}
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink">{p.colour ?? "Colour tbc"}</div>
                    <div className="text-xs text-muted-foreground">{p.sex === "female" ? "Female" : p.sex === "male" ? "Male" : "Sex tbc"}{last ? ` · ${last.weight_g} g` : ""}</div>
                    <div className="mt-2"><Badge tone={meta.tone}>{meta.label}</Badge></div>
                    {p.allocation && <div className="mt-1 truncate text-xs text-muted-foreground">{fullName(p.allocation.application.people)}</div>}
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Linked waitlist */}
        <Card>
          <CardHeader>
            <CardTitle>Waitlist</CardTitle>
            <Button asChild variant="outline" size="sm"><Link href={`/litters/${litter.id}/matching`}>Manage matching</Link></Button>
          </CardHeader>
          {linked.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nobody on the waitlist yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {linked.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <Link href={`/applications/${a.id}`} className="block truncate text-sm font-medium text-ink hover:underline">{a.waitlist_position ? `#${a.waitlist_position} ` : ""}{fullName(a.people)}</Link>
                    <div className="truncate text-xs text-muted-foreground">{preferenceSummary(a)}</div>
                  </div>
                  <Badge tone={matchedIds.has(a.id) ? "green" : "yellow"}>{matchedIds.has(a.id) ? "Matched" : "Waiting"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Key dates */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Key dates</CardTitle></CardHeader>
        <div className="grid gap-3 sm:grid-cols-4">
          {keyDates.map((k) => (
            <div key={k.label} className={cn("rounded-xl border p-3", k.done ? "border-green-200 bg-green-50" : "border-border bg-cream")}>
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="font-semibold text-ink">{k.date ? fmtDate(k.date) : k.note || "tbc"}</div>
              {k.date && <div className={cn("text-xs", k.done ? "text-green-700" : "text-muted-foreground")}>{k.done ? "Done" : k.note || `${Math.abs(daysSince(k.date) ?? 0)} days ${(daysSince(k.date) ?? 0) > 0 ? "ago" : "away"}`}</div>}
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="photos" className="mt-6">
        <TabsList>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="edit">Edit litter</TabsTrigger>
        </TabsList>
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Litter photos</CardTitle>
              <PhotoUpload ownerType="litter" ownerId={litter.id} revalidate={`/litters/${litter.id}`} withCaption />
            </CardHeader>
            <PhotoGrid photos={photos} revalidate={`/litters/${litter.id}`} />
          </Card>
        </TabsContent>
        <TabsContent value="updates">
          <div className="rounded-xl border border-dashed border-border bg-white/60 p-10 text-center text-sm text-muted-foreground">Litter updates (write once, email everyone linked to this litter) arrive in step 6b.</div>
        </TabsContent>
        <TabsContent value="edit">
          <Card><LitterForm litter={litter} dogs={dogs} /></Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function collarStyle(colour: string | null) {
  if (!colour) return undefined;
  const map: Record<string, string> = { pink: "#F9A8D4", blue: "#93C5FD", green: "#86EFAC", red: "#FCA5A5", yellow: "#FDE68A", purple: "#C4B5FD", orange: "#FDBA74", black: "#374151", white: "#F3F4F6", teal: "#5EEAD4", brown: "#A16207", grey: "#D1D5DB" };
  const bg = map[colour.toLowerCase()];
  return bg ? { backgroundColor: bg, color: ["black", "brown"].includes(colour.toLowerCase()) ? "#fff" : "#3D2A35" } : undefined;
}
