import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { ApplicationCard } from "@/lib/data/applications";
import { preferenceSummary } from "@/lib/stages";
import { ago, daysSince } from "@/lib/format";
import { fullName, cn } from "@/lib/utils";
import { StageMenu } from "./stage-menu";
import { StageBadge } from "@/components/stage-badge";

export function ApplicationCardView({ app, wide = false }: { app: ApplicationCard; wide?: boolean }) {
  const quiet = daysSince(app.last_activity_at);
  const stale = quiet !== null && quiet >= 7 && !["placed", "declined", "withdrawn", "on_hold"].includes(app.stage);

  return (
    <article className={cn("group rounded-lg border border-border/70 bg-white p-3 shadow-sm transition-shadow hover:shadow-md", wide && "flex items-start gap-3")}>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/applications/${app.id}`} className="min-w-0 font-medium text-ink hover:underline">
            <span className="block truncate">{fullName(app.people)}</span>
          </Link>
          <StageMenu id={app.id} stage={app.stage} />
        </div>
        {wide && <StageBadge stage={app.stage} className="mt-1" />}
        <p className="mt-1 truncate text-xs text-muted-foreground">{preferenceSummary(app)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {app.people.suburb && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {app.people.suburb}
            </span>
          )}
          <span className={cn("inline-flex items-center gap-1", stale && "font-medium text-orange-700")} title="Last contact">
            <Clock className="h-3 w-3" /> {ago(app.last_activity_at)}
          </span>
          {app.stage === "waitlisted" && app.waitlist_position && <span className="rounded bg-sun-soft px-1.5 font-medium text-orange-800">#{app.waitlist_position}</span>}
        </div>
        {app.last_activity_body && <p className="mt-2 line-clamp-2 text-xs text-ink/70">{app.last_activity_body}</p>}
      </div>
    </article>
  );
}
