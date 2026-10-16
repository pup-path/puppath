"use client";

import { useRef, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadPhoto } from "@/app/(app)/media-actions";
import { cn } from "@/lib/utils";

/** Resize in the browser to keep uploads small (phones produce 4 to 12 MB originals). */
async function shrink(file: File, max = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export function PhotoUpload({
  ownerType,
  ownerId,
  revalidate,
  label = "Add photo",
  withCaption = false,
  className,
}: {
  ownerType: "dog" | "puppy" | "litter" | "application" | "litter_update";
  ownerId: string;
  revalidate: string;
  label?: string;
  withCaption?: boolean;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [caption, setCaption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (f: File | undefined) => {
    if (!f) return;
    start(async () => {
      const small = await shrink(f);
      const fd = new FormData();
      fd.set("file", small);
      if (caption) fd.set("caption", caption);
      const r = await uploadPhoto(ownerType, ownerId, revalidate, fd);
      if (r?.error) toast.error(r.error);
      else {
        toast.success("Photo added");
        setCaption("");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {withCaption && (
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm" />
      )}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
        <Camera /> {pending ? "Uploading…" : label}
      </Button>
    </div>
  );
}
