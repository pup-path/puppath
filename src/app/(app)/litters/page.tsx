import Link from "next/link";
import { Plus } from "lucide-react";
import { listLitters } from "@/lib/data/breeding";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LITTER_STATUS_META } from "@/lib/litters";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Litters" };

export default async function LittersPage() {
  const litters = await listLitters();
  const active = litters.filter((l) => l.status !== "complete");
  const done = litters.filter((l) => l.status === "complete");

  return (
    <>
      <PageHeader title="Litters" description="From planned pairing to the last puppy going home.">
        <Button asChild><Link href="/litters/new"><Plus /> New litter</Link></Button>
      </PageHeader>
      {litters.length === 0 ? (
        <EmptyState title="No litters yet" body="Create one when a pairing is planned. Puppies, matching and go-home dates all hang off it.">
          <Button asChild><Link href="/litters/new">Create the first litter</Link></Button>
        </EmptyState>
      ) : (
        <>
          <LitterList items={active} />
          {done.length > 0 && (
            <>
              <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Complete</h2>
              <LitterList items={done} />
            </>
          )}
        </>
      )}
    </>
  );
}

function LitterList({ items }: { items: Awaited<ReturnType<typeof listLitters>> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((l) => {
        const total = l.puppies.length;
        const matched = l.puppies.filter((p) => p.status === "matched" || p.status === "placed").length;
        const avail = l.puppies.filter((p) => p.status === "available").length;
        const when = l.status === "planned" ? (l.mating_date ? `Mating ${fmtDate(l.mating_date)}` : "No dates yet") : l.status === "confirmed" ? `Due ${fmtDate(l.due_date)}` : `Born ${fmtDate(l.whelped_date)}${l.go_home_date ? ` · home ${fmtDate(l.go_home_date)}` : ""}`;
        return (
          <Link key={l.id} href={`/litters/${l.id}`} className="rounded-xl border border-border/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-ink">{l.code}</div>
                <div className="text-xs text-muted-foreground">{l.dam?.name ?? "?"} × {l.sire?.name ?? "?"}</div>
              </div>
              <Badge tone={LITTER_STATUS_META[l.status].tone}>{LITTER_STATUS_META[l.status].label}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{when}</span>
              {total > 0 ? <span>{total} puppies · {matched} matched · {avail} available</span> : l.expected_count ? <span>~{l.expected_count} expected</span> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
