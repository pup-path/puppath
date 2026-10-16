"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { COLLAR_COLOURS, PUPPY_STATUS_META } from "@/lib/litters";
import { fmtDate } from "@/lib/format";
import { addWeight, deletePuppy, deleteWeight, updatePuppy } from "../../../actions";
import type { PuppyWithAllocation } from "@/lib/data/breeding";

const MANUAL_STATUSES = ["available", "held", "deceased"] as const;

export function PuppyForm({ puppy, litterId }: { puppy: PuppyWithAllocation; litterId: string }) {
  const [pending, start] = useTransition();
  const locked = puppy.status === "matched" || puppy.status === "placed";
  return (
    <form
      action={(fd) => start(async () => { const r = await updatePuppy(puppy.id, litterId, fd); if (r?.error) toast.error(r.error); else toast.success("Saved"); })}
      className="grid gap-3 sm:grid-cols-2"
    >
      <Field label="Collar">
        <Select name="collar_colour" defaultValue={puppy.collar_colour ?? ""}>
          <option value="">None</option>
          {COLLAR_COLOURS.map((c) => <option key={c} value={c}>{c}</option>)}
          {puppy.collar_colour && !COLLAR_COLOURS.includes(puppy.collar_colour) && <option value={puppy.collar_colour}>{puppy.collar_colour}</option>}
        </Select>
      </Field>
      <Field label="Nickname"><Input name="temp_name" defaultValue={puppy.temp_name ?? ""} placeholder="Until the family names them" /></Field>
      <Field label="Sex">
        <Select name="sex" defaultValue={puppy.sex ?? ""}>
          <option value="">Not sure yet</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </Select>
      </Field>
      <Field label="Colour"><Input name="colour" defaultValue={puppy.colour ?? ""} placeholder="Apricot, red, chocolate…" /></Field>
      <Field label="Birth weight (g)"><Input name="birth_weight_g" type="number" min={0} defaultValue={puppy.birth_weight_g ?? ""} /></Field>
      <Field label="Microchip"><Input name="microchip" defaultValue={puppy.microchip ?? ""} /></Field>
      <Field label="Status" hint={locked ? "Set by the match. Cancel the match to change it." : "Hold a puppy back to keep it out of matching."}>
        {locked ? (
          <Input value={PUPPY_STATUS_META[puppy.status].label} disabled />
        ) : (
          <Select name="status" defaultValue={puppy.status}>
            {MANUAL_STATUSES.map((s) => <option key={s} value={s}>{PUPPY_STATUS_META[s].label}</option>)}
          </Select>
        )}
      </Field>
      <Field label="Temperament" className="sm:col-span-2"><Textarea name="temperament_notes" rows={3} defaultValue={puppy.temperament_notes ?? ""} placeholder="Bold, cuddly, first to the food bowl…" /></Field>
      <Field label="Notes" className="sm:col-span-2"><Textarea name="notes" rows={3} defaultValue={puppy.notes ?? ""} /></Field>
      <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={pending}>Save</Button></div>
    </form>
  );
}

export function WeightLog({ puppyId, litterId, weights, birthWeight }: { puppyId: string; litterId: string; weights: PuppyWithAllocation["weights"]; birthWeight: number | null }) {
  const [pending, start] = useTransition();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-3">
      <form
        action={(fd) => start(async () => { const r = await addWeight(puppyId, litterId, fd); if (r?.error) toast.error(r.error); })}
        className="flex items-end gap-2"
      >
        <Field label="Grams" className="flex-1"><Input name="weight_g" type="number" min={1} required /></Field>
        <Field label="On" className="flex-1"><Input name="recorded_on" type="date" defaultValue={today} /></Field>
        <Button type="submit" size="sm" disabled={pending}>Add</Button>
      </form>
      {weights.length === 0 && !birthWeight ? (
        <p className="text-sm text-muted-foreground">No weights yet.</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {birthWeight ? <li className="flex justify-between py-1.5 text-muted-foreground"><span>Birth</span><span>{birthWeight} g</span></li> : null}
          {weights.map((w, i) => {
            const prev = i === 0 ? birthWeight : weights[i - 1].weight_g;
            const delta = prev ? w.weight_g - prev : null;
            return (
              <li key={w.id} className="group flex items-center justify-between gap-2 py-1.5">
                <span>{fmtDate(w.recorded_on)}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-ink">{w.weight_g} g</span>
                  {delta !== null && <span className={delta >= 0 ? "text-xs text-green-700" : "text-xs text-red-600"}>{delta >= 0 ? "+" : ""}{delta}</span>}
                  <button type="button" disabled={pending} aria-label="Delete weight" onClick={() => start(async () => { const r = await deleteWeight(w.id, litterId, puppyId); if (r?.error) toast.error(r.error); })} className="text-muted-foreground opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DeletePuppy({ puppyId, litterId }: { puppyId: string; litterId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-red-600 hover:text-red-700"
      onClick={() => { if (confirm("Delete this puppy and its weights and photos? This cannot be undone.")) start(async () => { const r = await deletePuppy(puppyId, litterId); if (r?.error) toast.error(r.error); }); }}
    >
      <Trash2 /> Delete puppy
    </Button>
  );
}
