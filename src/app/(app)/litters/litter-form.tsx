"use client";

import { useActionState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { createLitter, updateLitter } from "./actions";
import { LITTER_STATUSES, LITTER_STATUS_META } from "@/lib/litters";
import type { Dog, Litter } from "@/lib/types";

export function LitterForm({ litter, dogs }: { litter?: Litter; dogs: Pick<Dog, "id" | "name" | "sex" | "status">[] }) {
  const [createState, createAction, creating] = useActionState(createLitter, undefined);
  const [saving, start] = useTransition();
  const dams = dogs.filter((d) => d.sex === "female");
  const sires = dogs.filter((d) => d.sex === "male");

  const action = litter
    ? (fd: FormData) =>
        start(async () => {
          const r = await updateLitter(litter.id, fd);
          if (r?.error) toast.error(r.error);
          else toast.success("Saved");
        })
    : createAction;

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Litter name" hint="How Jen refers to it. Dam × sire and a season works well." className="sm:col-span-2">
        <Input name="code" defaultValue={litter?.code} placeholder="Maple × Teddy, Spring 2026" required autoFocus={!litter} />
      </Field>
      <Field label="Dam">
        <Select name="dam_id" defaultValue={litter?.dam_id ?? ""}>
          <option value="">Choose…</option>
          {dams.map((d) => (
            <option key={d.id} value={d.id}>{d.name}{d.status !== "active" ? ` (${d.status})` : ""}</option>
          ))}
        </Select>
      </Field>
      <Field label="Sire">
        <Select name="sire_id" defaultValue={litter?.sire_id ?? ""}>
          <option value="">Choose…</option>
          {sires.map((d) => (
            <option key={d.id} value={d.id}>{d.name}{d.status !== "active" ? ` (${d.status})` : ""}</option>
          ))}
        </Select>
      </Field>
      <Field label="Mating date" hint="Due date fills in at 63 days if left blank."><Input name="mating_date" type="date" defaultValue={litter?.mating_date ?? ""} /></Field>
      <Field label="Due date"><Input name="due_date" type="date" defaultValue={litter?.due_date ?? ""} /></Field>
      <Field label="Born"><Input name="whelped_date" type="date" defaultValue={litter?.whelped_date ?? ""} /></Field>
      <Field label="Go-home date" hint="Defaults to 8 weeks after birth."><Input name="go_home_date" type="date" defaultValue={litter?.go_home_date ?? ""} /></Field>
      <Field label="Status">
        <Select name="status" defaultValue={litter?.status ?? "planned"}>
          {LITTER_STATUSES.map((s) => (
            <option key={s} value={s}>{LITTER_STATUS_META[s].label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Expected puppies" hint="From the scan, if known."><Input name="expected_count" type="number" min={0} defaultValue={litter?.expected_count ?? ""} /></Field>
      <Field label="Notes" className="sm:col-span-2"><Textarea name="notes" defaultValue={litter?.notes ?? ""} rows={3} /></Field>
      <div className="flex items-center justify-end gap-3 sm:col-span-2">
        {createState?.error && <p className="mr-auto text-sm text-red-700">{createState.error}</p>}
        <Button type="submit" disabled={creating || saving}>{litter ? "Save" : "Create litter"}</Button>
      </div>
    </form>
  );
}
