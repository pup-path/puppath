import { ArrowDownLeft, ArrowUpRight, FileText, GitCommitHorizontal, Mail, MessageSquare, Phone, Users, Dog, Sparkles } from "lucide-react";
import type { Activity } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { CHANNEL_LABEL } from "@/lib/stages";
import { cn } from "@/lib/utils";

const ICON = {
  note: FileText,
  message: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Users,
  stage_change: GitCommitHorizontal,
  allocation: Dog,
  system: Sparkles,
} as const;

export function Timeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return <p className="text-sm text-muted-foreground">Nothing logged yet.</p>;
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {activities.map((a) => {
        const Icon = ICON[a.type];
        const system = a.type === "stage_change" || a.type === "system" || a.type === "allocation";
        return (
          <li key={a.id} className="relative">
            <span className={cn("absolute -left-[1.6rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-white", system ? "border-border text-muted-foreground" : "border-sun text-sun")}>
              <Icon className="h-3 w-3" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <span className={cn("text-xs font-medium", system ? "text-muted-foreground" : "text-ink")}>
                {labelFor(a)}
              </span>
              <time className="text-[11px] text-muted-foreground" dateTime={a.occurred_at}>{fmtDate(a.occurred_at, true)}</time>
            </div>
            {a.body && <p className={cn("mt-0.5 whitespace-pre-wrap text-sm", system ? "text-muted-foreground" : "text-ink")}>{a.body}</p>}
          </li>
        );
      })}
    </ol>
  );
}

function labelFor(a: Activity) {
  const dir = a.direction === "in" ? <ArrowDownLeft className="inline h-3 w-3" /> : a.direction === "out" ? <ArrowUpRight className="inline h-3 w-3" /> : null;
  const chan = a.channel ? CHANNEL_LABEL[a.channel] : null;
  switch (a.type) {
    case "note": return "Note";
    case "message": return <>{dir} {chan ?? "Message"}{a.direction === "in" ? " received" : a.direction === "out" ? " sent" : ""}</>;
    case "call": return <>{dir} Call{a.direction === "in" ? " received" : a.direction === "out" ? " made" : ""}</>;
    case "email": return <>{dir} Email{a.direction === "in" ? " received" : a.direction === "out" ? " sent" : ""}</>;
    case "meeting": return "Meeting";
    case "stage_change": return "Stage";
    case "allocation": return "Puppy";
    default: return "System";
  }
}
