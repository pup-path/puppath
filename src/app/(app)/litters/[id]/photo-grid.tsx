"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { deletePhoto } from "@/app/(app)/media-actions";

export function PhotoGrid({ photos, revalidate }: { photos: { id: string; url: string | null; caption: string | null }[]; revalidate: string }) {
  const [pending, start] = useTransition();
  if (photos.length === 0) return <p className="text-sm text-muted-foreground">No photos yet.</p>;
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {photos.map((p) => (
        <figure key={p.id} className="group relative overflow-hidden rounded-lg bg-muted">
          {p.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.url} alt={p.caption ?? ""} className="aspect-square w-full object-cover" />
          )}
          {p.caption && <figcaption className="truncate px-1.5 py-1 text-[11px] text-muted-foreground">{p.caption}</figcaption>}
          <button
            type="button"
            disabled={pending}
            onClick={() => { if (confirm("Remove this photo?")) start(async () => { const r = await deletePhoto(p.id, revalidate); if (r?.error) toast.error(r.error); }); }}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove photo"
          >
            <X className="h-3 w-3" />
          </button>
        </figure>
      ))}
    </div>
  );
}
