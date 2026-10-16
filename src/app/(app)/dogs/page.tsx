import Link from "next/link";
import { Plus } from "lucide-react";
import { listDogs } from "@/lib/data/breeding";
import { signedUrls } from "@/lib/media";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DogAvatar } from "./dog-avatar";
import { ageFrom } from "./age";

export const metadata = { title: "Dogs" };

export default async function DogsPage() {
  const dogs = await listDogs();
  const urls = await signedUrls(dogs.map((d) => d.photo_path));

  return (
    <>
      <PageHeader title="Dogs" description="Dams, sires and the external studs you use.">
        <Button asChild><Link href="/dogs/new"><Plus /> Add dog</Link></Button>
      </PageHeader>
      {dogs.length === 0 ? (
        <EmptyState title="No dogs yet" body="Add your girls and the sires you use, then litters can be linked to their parents.">
          <Button asChild><Link href="/dogs/new">Add the first dog</Link></Button>
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dogs.map((d) => (
            <Link key={d.id} href={`/dogs/${d.id}`} className="flex items-center gap-4 rounded-xl border border-border/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <DogAvatar name={d.name} sex={d.sex} url={urls.get(d.photo_path ?? "") ?? null} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-ink">{d.name}</span>
                  {d.status !== "active" && <Badge>{d.status}</Badge>}
                  {d.is_external && <Badge tone="blue">External</Badge>}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {[d.sex === "female" ? "Dam" : "Sire", d.generation, d.colour, ageFrom(d.dob)].filter(Boolean).join(" · ")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
