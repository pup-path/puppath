import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDog, listDogs } from "@/lib/data/breeding";
import { signedUrl } from "@/lib/media";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoUpload } from "@/components/photo-upload";
import { DogAvatar } from "../dog-avatar";
import { DogForm } from "../dog-form";
import { ageFrom } from "../age";
import { fmtDate } from "@/lib/format";
import { LITTER_STATUS_META } from "@/lib/litters";

export default async function DogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getDog(id);
  if (!result) notFound();
  const { dog, litters, nameById } = result;
  const [photo, allDogs] = await Promise.all([signedUrl(dog.photo_path), listDogs()]);

  const facts: [string, string | null][] = [
    ["Breed", [dog.breed_type, dog.generation].filter(Boolean).join(" ") || null],
    ["DOB", dog.dob ? `${fmtDate(dog.dob)} (${ageFrom(dog.dob)})` : null],
    ["Sex", dog.sex === "female" ? "Female" : "Male"],
    ["Microchip", dog.microchip],
    ["Colour", dog.colour],
    ["Sire", dog.sire_id ? nameById.get(dog.sire_id) ?? null : null],
    ["Dam", dog.dam_id ? nameById.get(dog.dam_id) ?? null : null],
    ["Registered name", dog.registered_name],
  ];

  return (
    <>
      <Link href="/dogs" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" /> Dogs</Link>

      {/* Header, per the Dog Profile wireframe */}
      <div className="mb-6 flex flex-wrap items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <DogAvatar name={dog.name} sex={dog.sex} url={photo} size="lg" />
          <PhotoUpload ownerType="dog" ownerId={dog.id} revalidate={`/dogs/${dog.id}`} label={photo ? "Change photo" : "Add photo"} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-ink">{dog.name}</h1>
            <Badge tone={dog.status === "active" ? "green" : "gray"}>{dog.status === "active" ? (dog.sex === "female" ? "Active dam" : "Active sire") : dog.status}</Badge>
            {dog.is_external && <Badge tone="blue">External</Badge>}
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt className="inline font-medium text-ink">{k}:</dt> <dd className="inline text-muted-foreground">{v}</dd></div>
            ))}
          </dl>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="breeding">Breeding</TabsTrigger>
          <TabsTrigger value="lineage">Lineage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Breeding history</CardTitle></CardHeader>
            {litters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No litters recorded for {dog.name} yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="pb-2">Litter</th><th className="pb-2">{dog.sex === "female" ? "Sire" : "Dam"}</th><th className="pb-2">Date</th><th className="pb-2">Puppies</th><th className="pb-2">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {litters.map((l) => {
                    const other = dog.sex === "female" ? l.sire_id : l.dam_id;
                    const f = l.puppies.filter((p) => p.sex === "female").length;
                    const m = l.puppies.filter((p) => p.sex === "male").length;
                    return (
                      <tr key={l.id}>
                        <td className="py-2 font-medium"><Link href={`/litters/${l.id}`} className="hover:underline">{l.code}</Link></td>
                        <td className="py-2">{other ? nameById.get(other) ?? "" : ""}</td>
                        <td className="py-2">{fmtDate(l.whelped_date ?? l.due_date ?? l.mating_date)}</td>
                        <td className="py-2">{l.puppies.length ? `${l.puppies.length} (${f}F, ${m}M)` : l.expected_count ? `~${l.expected_count}` : ""}</td>
                        <td className="py-2"><Badge tone={LITTER_STATUS_META[l.status].tone}>{LITTER_STATUS_META[l.status].label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {dog.notes && <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{dog.notes}</p>}
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card><DogForm dog={dog} parents={allDogs.map((d) => ({ id: d.id, name: d.name, sex: d.sex }))} /></Card>
        </TabsContent>

        <TabsContent value="health"><Later what="DNA results, hips and elbows, vaccinations and the breeding-readiness checklist" /></TabsContent>
        <TabsContent value="breeding"><Later what="Heat cycles, progesterone tests and breeding plans with compatibility checks" /></TabsContent>
        <TabsContent value="lineage"><Later what="The family tree" /></TabsContent>
      </Tabs>
    </>
  );
}

function Later({ what }: { what: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-white/60 p-10 text-center text-sm text-muted-foreground">{what} come after the first litter has run through PupPath.</div>;
}
