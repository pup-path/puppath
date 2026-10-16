import Link from "next/link";
import { Plus, LayoutGrid, List } from "lucide-react";
import { listApplications } from "@/lib/data/applications";
import { FORWARD_STAGES, STAGE_META } from "@/lib/stages";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ApplicationCardView } from "./card";
import { cn } from "@/lib/utils";
import type { ApplicationStage } from "@/lib/types";

export const metadata = { title: "Pipeline" };

export default async function PipelinePage({ searchParams }: { searchParams: Promise<{ view?: string; show?: string }> }) {
  const { view = "board", show } = await searchParams;
  const includeClosed = show === "all";
  const apps = await listApplications({ includeClosed });

  const byStage = new Map<ApplicationStage, typeof apps>();
  for (const s of FORWARD_STAGES) byStage.set(s, []);
  byStage.set("on_hold", []);
  if (includeClosed) {
    byStage.set("declined", []);
    byStage.set("withdrawn", []);
  }
  for (const a of apps) byStage.get(a.stage)?.push(a);

  const toggle = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { view, show, ...params };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    return `/pipeline?${sp.toString()}`;
  };

  return (
    <>
      <PageHeader title="Pipeline" description={`${apps.length} ${apps.length === 1 ? "person" : "people"} in play`}>
        <div className="hidden rounded-lg border border-border bg-white p-0.5 md:flex">
          <Link href={toggle({ view: "board" })} className={cn("rounded-md p-1.5", view === "board" ? "bg-sun-soft text-orange-700" : "text-muted-foreground")} title="Board">
            <LayoutGrid className="h-4 w-4" />
          </Link>
          <Link href={toggle({ view: "list" })} className={cn("rounded-md p-1.5", view === "list" ? "bg-sun-soft text-orange-700" : "text-muted-foreground")} title="List">
            <List className="h-4 w-4" />
          </Link>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={toggle({ show: includeClosed ? undefined : "all" })}>{includeClosed ? "Hide declined and withdrawn" : "Show declined and withdrawn"}</Link>
        </Button>
        <Button asChild>
          <Link href="/applications/new">
            <Plus /> Add enquiry
          </Link>
        </Button>
      </PageHeader>

      {apps.length === 0 ? (
        <EmptyState title="Nothing in the pipeline yet" body="Add the enquiries from the notepad and WhatsApp, or share the public enquiry form link.">
          <Button asChild>
            <Link href="/applications/new">Add the first enquiry</Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          {/* Board: desktop only */}
          <div className={cn("gap-4 overflow-x-auto pb-4", view === "board" ? "hidden md:flex" : "hidden")}>
            {[...byStage.entries()].map(([stage, items]) => (
              <section key={stage} className="flex w-64 shrink-0 flex-col rounded-xl bg-muted/60 p-2">
                <header className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm font-semibold text-ink">{STAGE_META[stage].label}</span>
                  <span className="rounded-full bg-white px-2 text-xs text-muted-foreground">{items.length}</span>
                </header>
                <div className="flex flex-col gap-2">
                  {items.map((a) => (
                    <ApplicationCardView key={a.id} app={a} />
                  ))}
                  {items.length === 0 && <div className="px-2 py-6 text-center text-xs text-muted-foreground">{STAGE_META[stage].hint}</div>}
                </div>
              </section>
            ))}
          </div>

          {/* List: mobile always, desktop when chosen */}
          <div className={cn("flex flex-col gap-2", view === "board" ? "md:hidden" : "")}>
            {[...byStage.entries()].map(([stage, items]) =>
              items.length === 0 ? null : (
                <section key={stage} className="mb-3">
                  <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {STAGE_META[stage].label} · {items.length}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {items.map((a) => (
                      <ApplicationCardView key={a.id} app={a} wide />
                    ))}
                  </div>
                </section>
              ),
            )}
          </div>
        </>
      )}
    </>
  );
}
