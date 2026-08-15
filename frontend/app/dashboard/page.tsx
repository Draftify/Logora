import { redirect } from "next/navigation";
import { Bell, Search, Sparkles, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { AnalysesPanel } from "@/components/dashboard/analyses-panel";
import { HealthIndicator } from "@/components/dashboard/health-indicator";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { SimulatedLogsPanel } from "@/components/dashboard/simulated-logs-panel";
import { Sidebar } from "@/components/dashboard/sidebar";

function displayName(email: string): string {
  const local = email.split("@")[0] ?? email;
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return name || "there";
}

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#05070d]" />
      <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-indigo-600/20 blur-[120px] animate-aurora" />
      <div className="absolute -right-40 top-1/4 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/15 blur-[120px] animate-aurora [animation-delay:-6s]" />
      <div className="absolute -bottom-40 left-1/3 h-[34rem] w-[34rem] rounded-full bg-cyan-500/15 blur-[120px] animate-aurora [animation-delay:-12s]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

function TopBar({ name }: { name: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span>Workspace</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300">Overview</span>
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

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = displayName(user.email);

  return (
    <div className="relative min-h-screen text-zinc-100">
      <BackgroundFX />
      <Sidebar email={user.email} />

      <main className="relative lg:pl-[272px]">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <TopBar name={name} />

          <section
            id="overview"
            className="relative mt-6 scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-indigo-600/25 via-violet-600/15 to-fuchsia-600/10 p-8 shadow-2xl shadow-indigo-950/40 sm:p-10"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-float-slow" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse-glow" />
            <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl animate-pulse-glow [animation-delay:-1.5s]" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Overview
              </span>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your event pipeline,{" "}
                <span className="text-gradient">in real time.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-indigo-100/80 sm:text-base">
                Monitor your queue, review AI-powered analyses, and keep an eye
                on server health from a single mission control.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium text-indigo-100/90">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-inset ring-white/10 backdrop-blur">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                  Live pipeline
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-inset ring-white/10 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                  AI insights
                </span>
              </div>
            </div>
          </section>

          <section id="metrics" className="mt-6 scroll-mt-24">
            <MetricsOverview />
          </section>

          <section id="analyses" className="mt-6 scroll-mt-24">
            <AnalysesPanel />
          </section>

          <section id="logs" className="mt-6 scroll-mt-24">
            <SimulatedLogsPanel />
          </section>

          <footer className="mt-12 border-t border-white/8 pb-8 pt-6 text-center text-xs text-zinc-600">
            Logora · real-time event analytics
          </footer>
        </div>
      </main>
    </div>
  );
}
