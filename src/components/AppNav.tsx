"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/studies", label: "Studies" },
  { href: "/upload", label: "Upload" },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function AppNav({ name, role }: { name?: string | null; role?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-white/[0.06] bg-oklch(0.08 0.005 260 / 0.8) backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 transition active:scale-95"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-bold shadow-lg shadow-emerald-500/10">
              CV
            </div>
            <span className="hidden text-sm font-semibold text-white sm:inline">
              CoreVita
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              className="h-8 w-44 rounded-lg border border-white/[0.06] bg-white/[0.04] pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/30 focus:bg-white/[0.06] focus:outline-none transition-colors"
              placeholder="Search studies..."
            />
          </div>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200">
            <span suppressHydrationWarning><Bell className="h-4 w-4" /></span>
          </button>
          <UserMenu name={name} role={role} />
        </div>
      </div>
    </header>
  );
}
