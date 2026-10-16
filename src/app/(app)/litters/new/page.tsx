import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listDogs } from "@/lib/data/breeding";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LitterForm } from "../litter-form";

export const metadata = { title: "New litter" };

export default async function NewLitterPage() {
  const dogs = await listDogs();
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/litters" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" /> Litters</Link>
      <PageHeader title="New litter" />
      {dogs.length === 0 && (
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
          No dogs yet. You can create the litter now and link the parents later, or <Button asChild variant="link" className="h-auto p-0"><Link href="/dogs/new">add a dog first</Link></Button>.
        </div>
      )}
      <Card><LitterForm dogs={dogs} /></Card>
    </div>
  );
}
