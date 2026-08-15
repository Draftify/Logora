import type { ReactNode } from "react";
import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description: "Track product events and surface insights as they happen.",
  },
  {
    icon: Sparkles,
    title: "AI-powered analysis",
    description: "DeepSeek turns raw events into clear, actionable summaries.",
  },
  {
    icon: ShieldCheck,
    title: "Secure sessions",
    description: "Sessions are protected and persist across visits.",
  },
];

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-200/60 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <section className="relative m-6 hidden overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <Logo variant="light" />
            <h2 className="mt-10 max-w-md text-3xl font-semibold leading-tight tracking-tight">
              Turn events into insight with AI.
            </h2>
            <p className="mt-3 max-w-md text-sm text-indigo-100">
              Logora captures, analyzes, and summarizes your product events so
              your team can move faster.
            </p>
          </div>

          <div className="relative mt-10 space-y-4">
            {features.map(
              ({ icon: Icon, title: featureTitle, description }) => (
                <div key={featureTitle} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{featureTitle}</p>
                    <p className="mt-0.5 text-xs text-indigo-100">
                      {description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="relative mt-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
            <div>
              <p className="text-xl font-semibold">24h</p>
              <p className="text-xs text-indigo-100">Session TTL</p>
            </div>
            <div>
              <p className="text-xl font-semibold">DeepSeek</p>
              <p className="text-xs text-indigo-100">AI model</p>
            </div>
            <div>
              <p className="text-xl font-semibold">Live</p>
              <p className="text-xs text-indigo-100">Health check</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="mb-6 flex justify-center lg:hidden">
                <Logo />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {title}
                </h1>
                <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/50">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
