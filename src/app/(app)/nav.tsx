"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Kanban, ListOrdered, Dog, Baby, Users, Settings, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/waitlist", label: "Waitlist", icon: ListOrdered },
  { href: "/people", label: "People", icon: Users },
  { href: "/litters", label: "Litters", icon: Baby },
  { href: "/dogs", label: "Dogs", icon: Dog },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-sun-soft text-orange-700" : "text-muted-foreground hover:bg-muted hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileNav({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-ink">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                <X />
              </Button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto border-t border-border pt-4 text-sm">
              <div className="font-medium text-ink">{name}</div>
              <div className="text-xs text-muted-foreground">{email}</div>
              <form action="/auth/signout" method="post" className="mt-3">
                <Button type="submit" variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                  <LogOut /> Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
