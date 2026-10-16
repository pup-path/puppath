import { getMember } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { NavLinks, MobileNav } from "./nav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const member = await getMember();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <Logo size="sm" />
          <div className="leading-tight">
            <div className="font-bold text-ink">PupPath</div>
            <div className="text-xs text-plum">{member.breederName}</div>
          </div>
        </div>
        <nav className="flex-1 px-3">
          <NavLinks />
        </nav>
        <div className="border-t border-border px-5 py-4 text-sm">
          <div className="truncate font-medium text-ink">{member.fullName}</div>
          <div className="truncate text-xs text-muted-foreground">{member.email}</div>
          <form action="/auth/signout" method="post" className="mt-3">
            <Button type="submit" variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
              <LogOut /> Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold text-ink">PupPath</span>
          </div>
          <MobileNav name={member.fullName} email={member.email} />
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
