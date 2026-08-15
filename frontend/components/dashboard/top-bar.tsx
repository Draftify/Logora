"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { HealthIndicator } from "./health-indicator";

const SECTION_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/metrics": "Metrics",
  "/dashboard/analyses": "Analyses",
  "/dashboard/logs": "Live logs",
  "/dashboard/agent": "Agent",
  "/dashboard/users": "Users",
  "/dashboard/health": "Health",
};

export function TopBar({ name }: { name: string }) {
  const pathname = usePathname();
  const section = SECTION_TITLES[pathname] ?? "Overview";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span>Workspace</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300">{section}</span>
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Good to see you, {name}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative hidden items-center md:flex">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            placeholder="Search events…"
            aria-label="Search events"
            className="h-10 w-56 rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 transition-colors focus:border-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-400 ring-2 ring-[#05070d]" />
        </button>

        <HealthIndicator />
      </div>
    </div>
  );
}
