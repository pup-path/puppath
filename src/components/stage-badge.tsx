import { Badge } from "@/components/ui/badge";
import { STAGE_META } from "@/lib/stages";
import type { ApplicationStage } from "@/lib/types";

export function StageBadge({ stage, className }: { stage: ApplicationStage; className?: string }) {
  const meta = STAGE_META[stage];
  return (
    <Badge tone={meta.tone} className={className} title={meta.hint}>
      {meta.label}
    </Badge>
  );
}
