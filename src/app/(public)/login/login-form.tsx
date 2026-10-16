"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {});

  if (state.sent) {
    return (
      <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
        Check your email for a sign-in link. It&apos;s valid for an hour. You can close this tab.
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? "/"} />
      <Field label="Email">
        <Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" autoFocus />
      </Field>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send sign-in link"}
      </Button>
    </form>
  );
}
