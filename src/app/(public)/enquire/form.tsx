"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Turnstile } from "../turnstile";
import { submitEnquiry, type PublicFormState } from "../public-actions";

export function EnquiryForm() {
  const [state, action, pending] = useActionState<PublicFormState, FormData>(submitEnquiry, {});
  const err = (k: string) => state.fieldErrors?.[k];

  if (state.ok) {
    return (
      <div className="mt-6 rounded-lg bg-green-50 p-5 text-sm text-green-900">
        <p className="font-semibold">Thanks, your message is with Jen.</p>
        <p className="mt-1">Check your inbox for a confirmation. If you&apos;d like to get ahead, you can fill in the full application now.</p>
        <Button asChild className="mt-4">
          <Link href="/apply">Start the application</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 grid gap-4 sm:grid-cols-2">
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="First name"><Input name="first_name" required autoComplete="given-name" />{err("first_name") && <p className="text-xs text-red-700">{err("first_name")}</p>}</Field>
      <Field label="Last name"><Input name="last_name" autoComplete="family-name" /></Field>
      <Field label="Email"><Input name="email" type="email" required autoComplete="email" />{err("email") && <p className="text-xs text-red-700">{err("email")}</p>}</Field>
      <Field label="Mobile"><Input name="phone" type="tel" autoComplete="tel" /></Field>
      <Field label="Suburb"><Input name="suburb" autoComplete="address-level2" /></Field>
      <Field label="How did you find us?">
        <Select name="source" defaultValue="website">
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="website">Google / website</option>
          <option value="referral">A friend or a previous NBG family</option>
          <option value="other">Somewhere else</option>
        </Select>
      </Field>
      <Field label="What are you hoping for?" className="sm:col-span-2" hint="Timing, boy or girl, colour, your household. Anything that helps.">
        <Textarea name="message" rows={5} required />
        {err("message") && <p className="text-xs text-red-700">{err("message")}</p>}
      </Field>
      <div className="sm:col-span-2"><Turnstile /></div>
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <p className="text-xs text-muted-foreground">We only use your details to talk to you about a puppy. Nothing is shared.</p>
        <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send to Jen"}</Button>
      </div>
      {state.error && <p className="text-sm text-red-700 sm:col-span-2">{state.error}</p>}
    </form>
  );
}
