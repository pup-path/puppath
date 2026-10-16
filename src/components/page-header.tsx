export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white/60 p-10 text-center">
      <div className="font-semibold text-ink">{title}</div>
      {body && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>}
      {children && <div className="mt-4 flex justify-center gap-2">{children}</div>}
    </div>
  );
}

export function ComingSoon({ title, step, body }: { title: string; step: number; body: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState title={`Coming in build step ${step}`} body={body} />
    </>
  );
}
