import { Logo } from "@/components/logo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "linear-gradient(180deg, var(--peach) 0%, var(--cream) 30%, #ffffff 100%)" }}
    >
      <header className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-8">
        <Logo size="sm" />
        <div>
          <div className="text-xs font-semibold text-plum">Northern Beaches Groodles</div>
          <div className="text-lg font-bold text-ink">PupPath</div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>
      <footer className="pb-8 text-center text-xs text-plum">Ethically bred with love on Sydney&apos;s Northern Beaches</footer>
    </div>
  );
}
