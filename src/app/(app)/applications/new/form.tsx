"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { SOURCE_LABEL, STAGE_META, FORWARD_STAGES } from "@/lib/stages";
import { createEnquiry } from "../actions";

export function NewEnquiryForm() {
  const [state, action, pending] = useActionState(createEnquiry, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="First name"><Input name="first_name" required autoFocus /></Field>
      <Field label="Last name"><Input name="last_name" /></Field>
      <Field label="Email" hint="Used to match repeat enquiries."><Input name="email" type="email" /></Field>
      <Field label="Phone"><Input name="phone" type="tel" /></Field>
      <Field label="Suburb"><Input name="suburb" /></Field>
      <Field label="How they found NBG">
        <Select name="source" defaultValue="whatsapp">
          {Object.entries(SOURCE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </Field>
      <Field label="Referred by" className="sm:col-span-2"><Input name="referred_by" placeholder="Name of the person or family who referred them" /></Field>
      <Field label="What they said" hint="Paste the message. It becomes the first entry on their timeline." className="sm:col-span-2">
        <Textarea name="message" rows={4} />
      </Field>
      <Field label="Start at stage" hint="Most start as an enquiry. Use Waitlisted for people already on the notepad list with a deposit paid.">
        <Select name="stage" defaultValue="enquiry">
          {FORWARD_STAGES.filter((s) => s !== "matched" && s !== "placed").map((s) => (
            <option key={s} value={s}>{STAGE_META[s].label}</option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end justify-end gap-2">
        {state?.error && <p className="mr-auto text-sm text-red-700">{state.error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add to pipeline"}</Button>
      </div>
    </form>
  );
}
