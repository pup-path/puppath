"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Turnstile } from "../turnstile";
import { submitApplication, type PublicFormState } from "../public-actions";
import type { Question, Step } from "@/lib/application-form";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "puppath-application-draft";

export function ApplicationForm({ steps }: { steps: Step[] }) {
  const [state, action, pending] = useActionState<PublicFormState, FormData>(submitApplication, {});
  const [stepIdx, setStepIdx] = useState(0);
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  // Draft autosave, per browser only.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      // One-time hydration of a saved draft; runs after mount on purpose.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setValues(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {}
  }, [values]);
  useEffect(() => {
    if (state.ok) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
    }
    // Jump to the first step with an error.
    if (state.fieldErrors) {
      const i = steps.findIndex((s) => s.questions.some((q) => state.fieldErrors?.[q.key]));
      // Responds to a server round-trip result; not a render-time derivation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (i >= 0) setStepIdx(i);
    }
  }, [state, steps]);

  const set = (key: string, v: string | string[]) => setValues((prev) => ({ ...prev, [key]: v }));

  const stepValid = () => {
    const missing = step.questions.filter((q) => "required" in q && q.required).filter((q) => {
      const v = values[q.key];
      return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
    });
    return missing.length === 0;
  };

  if (state.ok) {
    return (
      <div className="mt-6 rounded-lg bg-green-50 p-5 text-sm text-green-900">
        <p className="font-semibold">Thank you. Your application is with Jen.</p>
        <p className="mt-1">You&apos;ll get a confirmation email now, and Jen will be in touch once she&apos;s read it properly.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="mt-6">
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {/* Progress */}
      <ol className="mb-6 flex flex-wrap gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={s.id} className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1", i === stepIdx ? "bg-sun text-white" : i < stepIdx ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground")}>
            <span className="font-semibold">{i + 1}</span> {s.title}
          </li>
        ))}
      </ol>

      {/* Every question of every step is rendered so the final submit carries all answers;
          only the current step is visible. */}
      {steps.map((s, i) => (
        <section key={s.id} className={cn(i === stepIdx ? "block" : "hidden")} aria-hidden={i !== stepIdx}>
          <h2 className="text-lg font-semibold">{s.title}</h2>
          {s.intro && <p className="mt-1 text-sm text-muted-foreground">{s.intro}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {s.questions.map((q) => (
              <QuestionField key={q.key} q={q} value={values[q.key]} onChange={(v) => set(q.key, v)} error={state.fieldErrors?.[q.key]} />
            ))}
          </div>
        </section>
      ))}

      {isLast && <div className="mt-4"><Turnstile /></div>}
      {state.error && <p className="mt-4 text-sm text-red-700">{state.error}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setStepIdx((i) => Math.max(0, i - 1))} disabled={stepIdx === 0}>
          Back
        </Button>
        <span className="text-xs text-muted-foreground">Your answers save in this browser as you go.</span>
        {isLast ? (
          <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send application"}</Button>
        ) : (
          <Button type="button" onClick={() => (stepValid() ? setStepIdx((i) => i + 1) : formRef.current?.reportValidity())}>
            Next
          </Button>
        )}
      </div>
    </form>
  );
}

function QuestionField({ q, value, onChange, error }: { q: Question; value: string | string[] | undefined; onChange: (v: string | string[]) => void; error?: string }) {
  const wide = q.type === "textarea" || q.type === "multi";
  const required = "required" in q && q.required;
  const v = (value ?? (q.type === "multi" ? [] : "")) as string & string[];
  return (
    <Field label={q.label + (required ? " *" : "")} hint={q.hint} className={cn(wide && "sm:col-span-2")}>
      {q.type === "text" && <Input name={q.key} value={v} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} required={required} />}
      {q.type === "textarea" && <Textarea name={q.key} value={v} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} required={required} rows={3} />}
      {q.type === "select" && (
        <Select name={q.key} value={v} onChange={(e) => onChange(e.target.value)} required={required}>
          <option value="">Choose…</option>
          {q.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      )}
      {q.type === "yesno" && (
        <div className="flex gap-2">
          {[
            ["yes", "Yes"],
            ["no", "No"],
          ].map(([val, label]) => (
            <label key={val} className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm", v === val ? "border-sun bg-sun-soft" : "border-border bg-white")}>
              <input type="radio" name={q.key} value={val} checked={v === val} onChange={() => onChange(val)} required={required} className="accent-[#E89B3C]" />
              {label}
            </label>
          ))}
        </div>
      )}
      {q.type === "multi" && (
        <div className="flex flex-wrap gap-2">
          {q.options.map((o) => {
            const on = (v as string[]).includes(o.value);
            return (
              <label key={o.value} className={cn("flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm", on ? "border-sun bg-sun-soft" : "border-border bg-white")}>
                <input type="checkbox" name={q.key} value={o.value} checked={on} onChange={(e) => onChange(e.target.checked ? [...(v as string[]), o.value] : (v as string[]).filter((x) => x !== o.value))} className="sr-only" />
                {o.label}
              </label>
            );
          })}
        </div>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </Field>
  );
}
