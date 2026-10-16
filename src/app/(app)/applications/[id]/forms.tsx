"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { recordDeposit, updateAssessment, updatePerson } from "../actions";
import { SEX_LABEL, SOURCE_LABEL, TIMING_LABEL } from "@/lib/stages";
import type { Application, Person } from "@/lib/types";
import { cn } from "@/lib/utils";

function useAction<T extends unknown[]>(fn: (...args: T) => Promise<{ error?: string; ok?: boolean } | undefined>, okMsg: string) {
  const [pending, start] = useTransition();
  const run = (...args: T) =>
    start(async () => {
      const res = await fn(...args);
      if (res?.error) toast.error(res.error);
      else toast.success(okMsg);
    });
  return [run, pending] as const;
}

export function DepositForm({ id }: { id: string }) {
  const [run, pending] = useAction((fd: FormData) => recordDeposit(id, fd), "Deposit recorded, moved to waitlist");
  return (
    <form action={run} className="flex flex-wrap items-end gap-2">
      <Field label="Amount (AUD)" className="w-40">
        <Input name="amount" type="number" min={0} step={50} placeholder="500" className="bg-white" />
      </Field>
      <Button type="submit" disabled={pending}>Record deposit received</Button>
    </form>
  );
}

export function AssessmentForm({ app }: { app: Application }) {
  const [rating, setRating] = useState<number | null>(app.internal_rating);
  const [run, pending] = useAction((fd: FormData) => updateAssessment(app.id, fd), "Saved");
  return (
    <form action={run} className="space-y-4">
      <input type="hidden" name="internal_rating" value={rating ?? ""} />
      <div>
        <div className="mb-1.5 text-sm font-medium text-ink">Fit</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(rating === n ? null : n)}
              className={cn("h-9 w-9 rounded-lg border text-sm font-medium transition-colors", rating !== null && n <= rating ? "border-sun bg-sun text-white" : "border-border bg-white text-muted-foreground hover:bg-muted")}
              aria-label={`${n} of 5`}
            >
              {n}
            </button>
          ))}
          <span className="ml-2 self-center text-xs text-muted-foreground">{rating ? ["", "Poor fit", "Unsure", "Reasonable", "Good", "Ideal home"][rating] : "Not rated"}</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Wants">
          <Select name="preferred_sex" defaultValue={app.preferred_sex ?? "any"}>
            {Object.entries(SEX_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </Field>
        <Field label="Colours" hint="Comma separated">
          <Input name="preferred_colours" defaultValue={app.preferred_colours?.join(", ")} placeholder="apricot, cream" />
        </Field>
        <Field label="Generation / size">
          <Input name="preferred_generation" defaultValue={app.preferred_generation ?? ""} placeholder="F1b mini" />
        </Field>
        <Field label="Timing">
          <Select name="timing" defaultValue={app.timing ?? "flexible"}>
            {Object.entries(TIMING_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Timing note">
        <Input name="timing_note" defaultValue={app.timing_note ?? ""} placeholder="e.g. after their trip in March" />
      </Field>
      <Field label="Private notes" hint="Only Jen and Jonathan see this.">
        <Textarea name="internal_notes" defaultValue={app.internal_notes ?? ""} placeholder="Impressions, concerns, what to follow up" />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>Save</Button>
      </div>
    </form>
  );
}

export function PersonForm({ person, applicationId }: { person: Person; applicationId: string }) {
  const [run, pending] = useAction((fd: FormData) => updatePerson(person.id, applicationId, fd), "Saved");
  return (
    <form action={run} className="grid gap-3 sm:grid-cols-2">
      <Field label="First name"><Input name="first_name" defaultValue={person.first_name} required /></Field>
      <Field label="Last name"><Input name="last_name" defaultValue={person.last_name ?? ""} /></Field>
      <Field label="Email"><Input name="email" type="email" defaultValue={person.email ?? ""} /></Field>
      <Field label="Phone"><Input name="phone" type="tel" defaultValue={person.phone ?? ""} /></Field>
      <Field label="Suburb"><Input name="suburb" defaultValue={person.suburb ?? ""} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="State"><Input name="state" defaultValue={person.state ?? ""} placeholder="NSW" /></Field>
        <Field label="Postcode"><Input name="postcode" defaultValue={person.postcode ?? ""} /></Field>
      </div>
      <Field label="How they found NBG">
        <Select name="source" defaultValue={person.source ?? ""}>
          <option value="">Unknown</option>
          {Object.entries(SOURCE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </Field>
      <Field label="Referred by"><Input name="referred_by" defaultValue={person.referred_by ?? ""} /></Field>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" variant="secondary" disabled={pending}>Save contact</Button>
      </div>
    </form>
  );
}
