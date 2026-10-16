import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getLitter } from "@/lib/data/breeding";
import { listMedia } from "@/lib/media";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUpload } from "@/components/photo-upload";
import { PhotoGrid } from "../../photo-grid";
import { PuppyForm, WeightLog, DeletePuppy } from "./forms";
import { PUPPY_STATUS_META } from "@/lib/litters";
import { fullName } from "@/lib/utils";
import { fmtDate } from "@/lib/format";

export default async function PuppyPage({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = await params;
  const result = await getLitter(id);
  if (!result) notFound();
  const puppy = result.puppies.find((p) => p.id === pid);
  if (!puppy) notFound();
  const photos = await listMedia("puppy", pid);
  const meta = PUPPY_STATUS_META[puppy.status];
  const title = puppy.temp_name ?? (puppy.collar_colour ? `${puppy.collar_colour} collar` : "Puppy");
  const here = `/litters/${id}/puppies/${pid}`;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/litters/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" /> {result.litter.code}</Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {puppy.sex === "female" ? "Female" : puppy.sex === "male" ? "Male" : "Sex tbc"}{puppy.colour ? ` · ${puppy.colour}` : ""}
            {result.litter.whelped_date ? ` · born ${fmtDate(result.litter.whelped_date)}` : ""}
          </p>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>

      {puppy.allocation && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <p className="text-sm text-green-900">
            {puppy.allocation.status === "offered" ? "Offered to" : puppy.allocation.status === "collected" ? "Went home with" : "Matched with"}{" "}
            <Link href={`/applications/${puppy.allocation.application_id}`} className="font-semibold hover:underline">{fullName(puppy.allocation.application.people)}</Link>.
            Status is driven by the match, so change it from the litter&apos;s matching page.
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <PuppyForm puppy={puppy} litterId={id} />
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Weights</CardTitle></CardHeader>
            <WeightLog puppyId={pid} litterId={id} weights={puppy.weights} birthWeight={puppy.birth_weight_g} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <PhotoUpload ownerType="puppy" ownerId={pid} revalidate={here} />
            </CardHeader>
            <PhotoGrid photos={photos} revalidate={here} />
          </Card>
          {!puppy.allocation && (
            <div className="text-right"><DeletePuppy puppyId={pid} litterId={id} /></div>
          )}
        </div>
      </div>
    </div>
  );
}
