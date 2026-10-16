"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { FORWARD_STAGES, EXIT_STAGES, STAGE_META } from "@/lib/stages";
import { setStage } from "../applications/actions";
import type { ApplicationStage } from "@/lib/types";

export function StageMenu({ id, stage, label }: { id: string; stage: ApplicationStage; label?: string }) {
  const [pending, start] = useTransition();
  const [closing, setClosing] = useState<ApplicationStage | null>(null);
  const [reason, setReason] = useState("");

  const move = (to: ApplicationStage, why?: string) =>
    start(async () => {
      const res = await setStage(id, to, why);
      if (res?.error) toast.error(res.error);
      else toast.success(`Moved to ${STAGE_META[to].label}`);
      setClosing(null);
      setReason("");
    });

  const choose = (to: ApplicationStage) => {
    if (to === "declined" || to === "withdrawn") setClosing(to);
    else move(to);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {label ? (
            <Button variant="outline" size="sm" disabled={pending}>{label}</Button>
          ) : (
            <button className="rounded-md p-1 text-muted-foreground opacity-60 hover:bg-muted hover:text-ink group-hover:opacity-100" aria-label="Move stage" disabled={pending}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {FORWARD_STAGES.filter((s) => s !== stage && s !== "matched" && s !== "placed").map((s) => (
            <DropdownMenuItem key={s} onSelect={() => choose(s)}>{STAGE_META[s].label}</DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {EXIT_STAGES.filter((s) => s !== stage).map((s) => (
            <DropdownMenuItem key={s} onSelect={() => choose(s)} className={s === "on_hold" ? "" : "text-red-700"}>
              {STAGE_META[s].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={closing !== null} onOpenChange={(o) => !o && setClosing(null)}>
        {closing && (
          <DialogContent title={closing === "declined" ? "Decline this application" : "Mark as withdrawn"} description="A short reason helps later when they ask, or re-apply.">
            <Field label="Reason (optional)">
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={closing === "declined" ? "e.g. Away from home 10+ hours a day" : "e.g. Found a puppy elsewhere"} />
            </Field>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setClosing(null)}>Cancel</Button>
              <Button variant={closing === "declined" ? "destructive" : "default"} onClick={() => move(closing, reason)} disabled={pending}>
                {STAGE_META[closing].label}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
