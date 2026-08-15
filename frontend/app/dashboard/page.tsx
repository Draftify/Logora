import Link from "next/link";
import {
  BarChart3,
  Bot,
  ChevronRight,
  HeartPulse,
  Sparkles,
  SquareTerminal,
  TrendingUp,
  Users,
} from "lucide-react";

const QUICK_LINKS = [
  {
    href: "/dashboard/metrics",
    label: "Metrics",
    description: "Queue and pipeline KPIs",
    icon: BarChart3,
  },
  {
    href: "/dashboard/analyses",
    label: "Analyses",
    description: "AI-generated insights",
    icon: Sparkles,
  },
  {
    href: "/dashboard/logs",
    label: "Live logs",
    description: "Stream sample events",
    icon: SquareTerminal,
  },
  {
    href: "/dashboard/agent",
    label: "Agent",
    description: "Chat with the assistant",
    icon: Bot,
  },
  {
    href: "/dashboard/users",
    label: "Users",
    description: "Manage members",
    icon: Users,
  },
  {
    href: "/dashboard/health",
    label: "Health",
    description: "Backend & Redis status",
    icon: HeartPulse,
  },
];

export default function DashboardPage() {
  return (
    <>
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-indigo-600/25 via-violet-600/15 to-fuchsia-600/10 p-8 shadow-2xl shadow-indigo-950/40 sm:p-10">
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
            Monitor your queue, review AI-powered analyses, and keep an eye on
            server health from a single mission control.
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

      <section className="mt-6">
        <h3 className="text-sm font-semibold text-zinc-300">Jump back in</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map(
            ({ href, label, description, icon: Icon }, index) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 rounded-2xl glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_24px_60px_-28px_rgba(99,102,241,0.5)] animate-fade-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300 ring-1 ring-inset ring-white/10 transition-colors group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-300" />
              </Link>
            ),
          )}
        </div>
      </section>
    </>
  );
}
