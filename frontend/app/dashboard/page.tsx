import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DeepSeekIcon } from "@/components/deepseek-icon";
import { AnalysesPanel } from "@/components/dashboard/analyses-panel";
import { AnalysisPlayground } from "@/components/dashboard/analysis-playground";
import { HealthIndicator } from "@/components/dashboard/health-indicator";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Logo } from "@/components/logo";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6 lg:px-8 lg:py-5">
          <Logo />

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1">
              <HealthIndicator />
              <DeepSeekIcon className="h-4 w-4 animate-pulse" />
            </div>
            <UserMenu email={user.email} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-lg sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-medium text-indigo-100">Overview</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {user.email}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-indigo-100">
              Monitor your event queue, review AI-powered analyses, and keep an
              eye on server health.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <MetricsOverview />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnalysesPanel />
          </div>

          <div className="space-y-6">
            <AnalysisPlayground />
          </div>
        </div>
      </section>
    </main>
  );
}
