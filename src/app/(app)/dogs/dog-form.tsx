"use client";

import { useActionState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { createDog, updateDog } from "./actions";
import type { Dog } from "@/lib/types";

type Parent = { id: string; name: string; sex: string };

export function DogForm({ dog, parents }: { dog?: Dog; parents: Parent[] }) {
  const [createState, createAction, creating] = useActionState(createDog, undefined);
  const [saving, start] = useTransition();
  const sires = parents.filter((p) => p.sex === "male" && p.id !== dog?.id);
  const dams = parents.filter((p) => p.sex === "female" && p.id !== dog?.id);

  const action = dog
    ? (fd: FormData) =>
        start(async () => {
          const r = await updateDog(dog.id, fd);
          if (r?.error) toast.error(r.error);
          else toast.success("Saved");
        })
    : createAction;

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name"><Input name="name" defaultValue={dog?.name} required autoFocus={!dog} /></Field>
      <Field label="Sex">
        <Select name="sex" defaultValue={dog?.sex ?? "female"}>
          <option value="female">Female (dam)</option>
          <option value="male">Male (sire)</option>
        </Select>
      </Field>
      <Field label="Registered name"><Input name="registered_name" defaultValue={dog?.registered_name ?? ""} /></Field>
      <Field label="Call name"><Input name="call_name" defaultValue={dog?.call_name ?? ""} placeholder="What you shout at the beach" /></Field>
      <Field label="Breed"><Input name="breed_type" defaultValue={dog?.breed_type ?? "Groodle"} /></Field>
      <Field label="Generation"><Input name="generation" defaultValue={dog?.generation ?? ""} placeholder="F1, F1b, Poodle…" /></Field>
      <Field label="Date of birth"><Input name="dob" type="date" defaultValue={dog?.dob ?? ""} /></Field>
      <Field label="Colour"><Input name="colour" defaultValue={dog?.colour ?? ""} /></Field>
      <Field label="Microchip"><Input name="microchip" defaultValue={dog?.microchip ?? ""} /></Field>
      <Field label="Status">
        <Select name="status" defaultValue={dog?.status ?? "active"}>
          <option value="active">Active</option>
          <option value="retired">Retired</option>
          <option value="deceased">Deceased</option>
        </Select>
      </Field>
      <Field label="Sire" hint="Only dogs already in PupPath.">
        <Select name="sire_id" defaultValue={dog?.sire_id ?? ""}>
          <option value="">Unknown / not in PupPath</option>
          {sires.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Dam">
        <Select name="dam_id" defaultValue={dog?.dam_id ?? ""}>
          <option value="">Unknown / not in PupPath</option>
          {dams.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="is_external" defaultChecked={dog?.is_external ?? false} className="h-4 w-4 accent-[#E89B3C]" />
        External dog (a stud or dam owned by someone else)
      </label>
      <Field label="Notes" className="sm:col-span-2"><Textarea name="notes" defaultValue={dog?.notes ?? ""} rows={3} /></Field>
      <div className="flex items-center justify-end gap-3 sm:col-span-2">
        {createState?.error && <p className="mr-auto text-sm text-red-700">{createState.error}</p>}
        <Button type="submit" disabled={creating || saving}>{dog ? "Save" : "Add dog"}</Button>
      </div>
    </form>
  );
}
