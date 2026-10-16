import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listDogs } from "@/lib/data/breeding";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { DogForm } from "../dog-form";

export const metadata = { title: "Add dog" };

export default async function NewDogPage() {
  const dogs = await listDogs();
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dogs" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" /> Dogs</Link>
      <PageHeader title="Add a dog" />
      <Card>
        <DogForm parents={dogs.map((d) => ({ id: d.id, name: d.name, sex: d.sex }))} />
      </Card>
    </div>
  );
}
