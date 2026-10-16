"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, Input, Select } from "@/components/ui/input";
import { COLLAR_COLOURS, LITTER_STATUSES, LITTER_STATUS_META } from "@/lib/litters";
import { addPuppy, recordBirth, setLitterStatus } from "../actions";
import type { LitterStatus } from "@/lib/types";

export function LitterStatusMenu({ id, status }: { id: string; status: LitterStatus }) {
  const [pending, start] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" size="sm" disabled={pending}>Change status</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Litter status</DropdownMenuLabel>
        {LITTER_STATUSES.filter((s) => s !== status).map((s) => (
          <DropdownMenuItem key={s} onSelect={() => start(async () => { const r = await setLitterStatus(id, s); if (r?.error) toast.error(r.error); })}>
            {LITTER_STATUS_META[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RecordBirth({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) => start(async () => { const r = await recordBirth(id, fd); if (r?.error) toast.error(r.error); else toast.success("Congratulations. Puppy cards created."); })}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label="Born on"><Input name="whelped_date" type="date" required className="bg-white" /></Field>
      <Field label="Girls"><Input name="females" type="number" min={0} defaultValue={0} className="w-20 bg-white" /></Field>
      <Field label="Boys"><Input name="males" type="number" min={0} defaultValue={0} className="w-20 bg-white" /></Field>
      <Button type="submit" disabled={pending}>Record birth</Button>
    </form>
  );
}

export function AddPuppy({ litterId }: { litterId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Plus /> Add puppy</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Add a puppy">
          <form
            action={(fd) => start(async () => { const r = await addPuppy(litterId, fd); if (r?.error) toast.error(r.error); else { toast.success("Added"); setOpen(false); } })}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Field label="Collar">
              <Select name="collar_colour" defaultValue="">
                <option value="">None yet</option>
                {COLLAR_COLOURS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Sex">
              <Select name="sex" defaultValue="">
                <option value="">Not sure yet</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </Select>
            </Field>
            <Field label="Colour"><Input name="colour" placeholder="Apricot" /></Field>
            <Field label="Birth weight (g)"><Input name="birth_weight_g" type="number" min={0} /></Field>
            <Field label="Nickname" className="sm:col-span-2"><Input name="temp_name" placeholder="Optional" /></Field>
            <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={pending}>Add</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
