import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listApplications } from "@/lib/data/applications";
import { getMember } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StageBadge } from "@/components/stage-badge";
import { daysSince, ago } from "@/lib/format";
import { fullName } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Home" };

export default async function HomePage() {
  const member = await getMember();
  const apps = await listApplications();

  const newEnquiries = apps.filter((a) => a.stage === "enquiry");
  const toReview = apps.filter((a) => a.stage === "applied" || a.stage === "reviewing");
  const awaitingDeposit = apps.filter((a) => a.stage === "approved");
  const quiet = apps.filter((a) => !["placed", "on_hold", "approved"].includes(a.stage) && (daysSince(a.last_activity_at) ?? 0) >= 7);
  const waitlisted = apps.filter((a) => a.stage === "waitlisted").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <>
      <PageHeader title={`${greeting}, ${member.fullName.split(" ")[0]}`} description={`${apps.length} people in the pipeline, ${waitlisted} on the waitlist.`} />

      <div className="grid gap-4 md:grid-cols-2">
        <AttentionCard title="New enquiries" body="Said hello, waiting on a reply." items={newEnquiries} empty="Inbox clear." />
        <AttentionCard title="Applications to review" body="Form is in. Needs a read and a decision." items={toReview} empty="Nothing to review." />
        <AttentionCard title="Deposit requested" body="Approved, waiting on the bank transfer." items={awaitingDeposit} empty="No deposits outstanding." />
        <AttentionCard title="Gone quiet" body="No contact for a week or more." items={quiet} empty="Everyone has been spoken to this week." showAgo />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild><Link href="/pipeline">Open the pipeline <ArrowRight /></Link></Button>
        <Button variant="outline" asChild><Link href="/applications/new">Add an enquiry</Link></Button>
      </div>
    </>
  );
}

function AttentionCard({ title, body, items, empty, showAgo }: { title: string; body: string; items: Awaited<ReturnType<typeof listApplications>>; empty: string; showAgo?: boolean }) {
  return (
    <Card>
      <CardHeader className="mb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{body}</p>
        </div>
        <span className="rounded-full bg-sun-soft px-2.5 py-0.5 text-sm font-semibold text-orange-800">{items.length}</span>
      </CardHeader>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.slice(0, 6).map((a) => (
            <li key={a.id}>
              <Link href={`/applications/${a.id}`} className="flex items-center justify-between gap-2 py-2 text-sm hover:text-orange-700">
                <span className="truncate font-medium">{fullName(a.people)}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {showAgo && ago(a.last_activity_at)}
                  <StageBadge stage={a.stage} />
                </span>
              </Link>
            </li>
          ))}
          {items.length > 6 && <li className="pt-2 text-xs text-muted-foreground">and {items.length - 6} more</li>}
        </ul>
      )}
    </Card>
  );
}
