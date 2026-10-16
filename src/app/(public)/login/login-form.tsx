"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { sendMagicLink, signInWithPassword, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<"link" | "password">("link");
  const [linkState, linkAction, linkPending] = useActionState<LoginState, FormData>(sendMagicLink, {});
  const [pwState, pwAction, pwPending] = useActionState<LoginState, FormData>(signInWithPassword, {});

  if (linkState.sent) {
    return (
      <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
        Check your email for a sign-in link. It&apos;s valid for an hour. You can close this tab.
      </div>
    );
  }

  if (mode === "password") {
    return (
      <form action={pwAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next ?? "/"} />
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" autoFocus />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        {pwState.error && <p className="text-sm text-red-700">{pwState.error}</p>}
        <Button type="submit" className="w-full" disabled={pwPending}>
          {pwPending ? "Signing in…" : "Sign in"}
        </Button>
        <button type="button" onClick={() => setMode("link")} className="block w-full text-center text-xs text-muted-foreground hover:text-ink">
          Email me a sign-in link instead
        </button>
      </form>
    );
  }

  return (
    <form action={linkAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? "/"} />
      <Field label="Email">
        <Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" autoFocus />
      </Field>
      {linkState.error && <p className="text-sm text-red-700">{linkState.error}</p>}
      <Button type="submit" className="w-full" disabled={linkPending}>
        {linkPending ? "Sending…" : "Send sign-in link"}
      </Button>
      <button type="button" onClick={() => setMode("password")} className="block w-full text-center text-xs text-muted-foreground hover:text-ink">
        Use a password instead
      </button>
    </form>
  );
}
