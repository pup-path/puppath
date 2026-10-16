import Link from "next/link";
import { listPeople } from "@/lib/data/applications";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StageBadge } from "@/components/stage-badge";
import { fullName } from "@/lib/utils";
import { fmtDate } from "@/lib/format";
import { SOURCE_LABEL } from "@/lib/stages";

export const metadata = { title: "People" };

export default async function PeoplePage() {
  const people = await listPeople();
  return (
    <>
      <PageHeader title="People" description="Everyone who has ever enquired, applied or taken a puppy home." />
      {people.length === 0 ? (
        <EmptyState title="No people yet" body="They appear here as enquiries are added." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">Contact</th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">Suburb</th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">Source</th>
                <th className="px-4 py-2 font-medium">Latest</th>
                <th className="hidden px-4 py-2 font-medium lg:table-cell">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {people.map((p) => {
                const latest = [...p.applications].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
                return (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2 font-medium text-ink">
                      {latest ? <Link href={`/applications/${latest.id}`} className="hover:underline">{fullName(p)}</Link> : fullName(p)}
                    </td>
                    <td className="hidden px-4 py-2 text-muted-foreground sm:table-cell">{p.email ?? p.phone ?? ""}</td>
                    <td className="hidden px-4 py-2 text-muted-foreground md:table-cell">{p.suburb ?? ""}</td>
                    <td className="hidden px-4 py-2 text-muted-foreground md:table-cell">{p.source ? SOURCE_LABEL[p.source] : ""}</td>
                    <td className="px-4 py-2">{latest ? <StageBadge stage={latest.stage} /> : <span className="text-xs text-muted-foreground">No application</span>}</td>
                    <td className="hidden px-4 py-2 text-muted-foreground lg:table-cell">{fmtDate(p.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
