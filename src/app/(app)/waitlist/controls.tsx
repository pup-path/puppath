"use client";

import { useTransition } from "react";
import { ChevronDown, ChevronUp, ListRestart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { moveWaitlist, compactWaitlist } from "./actions";

export function MoveButtons({ id, first, last }: { id: string; first: boolean; last: boolean }) {
  const [pending, start] = useTransition();
  const move = (dir: "up" | "down") =>
    start(async () => {
      const r = await moveWaitlist(id, dir);
      if (r?.error) toast.error(r.error);
    });
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move("up")} disabled={first || pending} aria-label="Move up">
        <ChevronUp />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move("down")} disabled={last || pending} aria-label="Move down">
        <ChevronDown />
      </Button>
    </div>
  );
}

export function CompactButton() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await compactWaitlist();
          if (r?.error) toast.error(r.error);
          else toast.success("Renumbered");
        })
      }
    >
      <ListRestart /> Renumber from 1
    </Button>
  );
}
