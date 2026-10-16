"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { ACTIVITY_TYPES, CHANNEL_LABEL } from "@/lib/stages";
import { addActivity } from "../actions";
import type { ActivityType } from "@/lib/types";

export function AddActivity({ applicationId, personId }: { applicationId: string; personId: string }) {
  const [type, setType] = useState<ActivityType>("note");
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const needsMeta = type !== "note";

  return (
    <form
      ref={formRef}
      action={(fd) =>
        start(async () => {
          const res = await addActivity(applicationId, personId, fd);
          if (res?.error) toast.error(res.error);
          else {
            toast.success("Logged");
            formRef.current?.reset();
            setType("note");
          }
        })
      }
      className="space-y-2 rounded-lg bg-muted/60 p-3"
    >
      <div className="grid grid-cols-3 gap-2">
        <Select name="type" value={type} onChange={(e) => setType(e.target.value as ActivityType)} className="h-9 text-xs">
          {ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
        {needsMeta ? (
          <>
            <Select name="direction" defaultValue="out" className="h-9 text-xs">
              <option value="out">Jen → them</option>
              <option value="in">Them → Jen</option>
            </Select>
            <Select name="channel" defaultValue={type === "call" ? "phone" : type === "email" ? "email" : type === "meeting" ? "in_person" : "whatsapp"} className="h-9 text-xs">
              {Object.entries(CHANNEL_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </>
        ) : (
          <div className="col-span-2" />
        )}
      </div>
      <Textarea name="body" placeholder={type === "note" ? "Private note, only Jen sees this" : "What was said, in a line or two"} className="min-h-[64px] bg-white text-sm" required />
      <div className="flex items-center justify-between gap-2">
        <input type="datetime-local" name="occurred_at" className="h-8 rounded-md border border-border bg-white px-2 text-xs text-muted-foreground" title="When it happened (blank = now)" />
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Log it"}</Button>
      </div>
    </form>
  );
}
