"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import { ALLOCATION_NEXT } from "@/lib/litters";
import { cn } from "@/lib/utils";
import { offerPuppy, setAllocationStatus, updateAllocationNotes } from "./actions";
import type { AllocationStatus, ApplicationStage } from "@/lib/types";

export interface Candidate {
  id: string;
  name: string;
  position: number | null;
  stage: ApplicationStage;
  prefs: string;
  sexFit: "yes" | "no" | "na";
  colourFit: "yes" | "no" | "na";
}

export function OfferDialog({ litterId, puppyId, puppyLabel, candidates }: { litterId: string; puppyId: string; puppyLabel: string; candidates: Candidate[] }) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const waitlisted = candidates.filter((c) => c.stage === "waitlisted");
  const others = candidates.filter((c) => c.stage !== "waitlisted");

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} disabled={candidates.length === 0}>Offer to a family</Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setChosen(null); }}>
        <DialogContent title={`Offer ${puppyLabel}`} description="Pick who gets the call. Their application moves to Matched and the offer shows on their timeline.">
          <form
            action={(fd) => start(async () => {
              const r = await offerPuppy(litterId, puppyId, fd);
              if (r?.error) toast.error(r.error);
              else { toast.success("Offered. Now go and make their day."); setOpen(false); setChosen(null); }
            })}
            className="space-y-4"
          >
            <input type="hidden" name="application_id" value={chosen ?? ""} />
            <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
              {waitlisted.length > 0 && <div className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Waitlist</div>}
              {waitlisted.map((c) => <CandidateRow key={c.id} c={c} chosen={chosen === c.id} onPick={() => setChosen(c.id)} />)}
              {others.length > 0 && <div className="px-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Approved, deposit not yet in</div>}
              {others.map((c) => <CandidateRow key={c.id} c={c} chosen={chosen === c.id} onPick={() => setChosen(c.id)} />)}
            </div>
            <Field label="Note (optional)"><Textarea name="notes" rows={2} placeholder="Why this match, or anything to remember when you call." /></Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!chosen || pending}>Offer puppy</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CandidateRow({ c, chosen, onPick }: { c: Candidate; chosen: boolean; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className={cn("flex w-full items-start justify-between gap-3 rounded-lg border p-2.5 text-left transition-colors", chosen ? "border-sun bg-sun-soft" : "border-border hover:bg-cream")}>
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{c.position ? <span className="text-muted-foreground">#{c.position} </span> : null}{c.name}</div>
        <div className="truncate text-xs text-muted-foreground">{c.prefs}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Fit label="Sex" fit={c.sexFit} />
        <Fit label="Colour" fit={c.colourFit} />
      </div>
    </button>
  );
}

function Fit({ label, fit }: { label: string; fit: "yes" | "no" | "na" }) {
  if (fit === "na") return null;
  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium", fit === "yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700")}>
      {fit === "yes" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {label}
    </span>
  );
}

export function AllocationActions({ allocationId, litterId, status, notes, family }: { allocationId: string; litterId: string; status: AllocationStatus; notes: string | null; family: string }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const next = ALLOCATION_NEXT[status];

  const go = (to: AllocationStatus) => {
    if (to === "cancelled" && !confirm(`Cancel the match with ${family}? The puppy goes back to available and they go back to the waitlist.`)) return;
    if (to === "collected" && !confirm(`${family} has taken the puppy home today?`)) return;
    start(async () => {
      const r = await setAllocationStatus(allocationId, litterId, to);
      if (r?.error) toast.error(r.error);
      else toast.success(to === "collected" ? "Gone home. Lovely." : "Updated");
    });
  };

  return (
    <div className="mt-3 space-y-2">
      {next.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {next.map((n) => (
            <Button key={n.to} size="sm" variant={n.variant ?? "default"} disabled={pending} onClick={() => go(n.to)}>{n.label}</Button>
          ))}
        </div>
      )}
      {editing ? (
        <form action={(fd) => start(async () => { const r = await updateAllocationNotes(allocationId, litterId, fd); if (r?.error) toast.error(r.error); else setEditing(false); })} className="flex items-end gap-2">
          <Textarea name="notes" rows={2} defaultValue={notes ?? ""} className="flex-1 bg-white" />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>Save</Button>
        </form>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="text-left text-xs text-muted-foreground hover:text-ink">
          {notes ? notes : "Add a note"}
        </button>
      )}
    </div>
  );
}
