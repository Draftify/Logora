"use client";

import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  BarChart3,
  Bot,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  SquareTerminal,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Metrics", href: "/dashboard/metrics", icon: BarChart3 },
  { label: "Analyses", href: "/dashboard/analyses", icon: Sparkles },
  { label: "Live logs", href: "/dashboard/logs", icon: SquareTerminal },
  { label: "Agent", href: "/dashboard/agent", icon: Bot },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Health", href: "/dashboard/health", icon: HeartPulse },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

function Avatar({ email, className }: { email: string; className?: string }) {
  const initial = email.trim().charAt(0).toUpperCase() || "U";

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50",
        className,
      )}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function SignOutRow() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1.5">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = isActive(pathname, href);

        return (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
            )}
          >
            {active ? (
              <span className="absolute inset-0 -z-10 rounded-xl bg-linear-to-r from-indigo-500/90 to-violet-600/90 shadow-lg shadow-indigo-950/50" />
            ) : null}
            <Icon
              className={cn(
                "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110",
                active ? "text-white" : "text-zinc-500",
              )}
            />
            {label}
            {active ? (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  email,
  pathname,
  onClose,
}: {
  email: string;
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-6">
        <Link href="/dashboard" onClick={onClose}>
          <Logo variant="light" />
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="px-5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Workspace
        </p>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-3">
        <NavLinks pathname={pathname} onNavigate={onClose} />
      </div>

      <div className="mt-auto border-t border-white/8 p-3">
        <div className="glass rounded-2xl p-3">
          <div className="flex items-center gap-3 px-1 pb-3">
            <Avatar email={email} className="h-10 w-10" />
            <div
              className="
min-w-0"
            >
              <p className="truncate text-sm font-semibold text-zinc-100">
                {email}
              </p>
              <p className="text-xs text-zinc-500">Account owner</p>
            </div>
          </div>
          <form action={logoutAction}>
            <SignOutRow />
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-[#05070d]/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/dashboard" onClick={() => setOpen(false)}>
          <Logo variant="light" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-200 transition-colors hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[272px] border-r border-white/8 bg-[#080b14]/90 backdrop-blur-2xl lg:block">
        <SidebarBody email={email} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[288px] border-r border-white/10 bg-[#080b14] shadow-2xl animate-scale-in">
            <SidebarBody
              email={email}
              pathname={pathname}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
