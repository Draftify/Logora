import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronDown,
  CircleCheck,
  Database,
  LineChart,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/logo";

const features = [
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description:
      "Capture product events and surface trends as they happen, without extra plumbing.",
  },
  {
    icon: Sparkles,
    title: "AI-powered summaries",
    description:
      "DeepSeek turns raw event streams into concise, actionable analysis.",
  },
  {
    icon: Database,
    title: "Event queue & batching",
    description:
      "High-throughput queues keep events reliable and processed in order.",
  },
  {
    icon: Activity,
    title: "Live health monitoring",
    description:
      "See backend and Redis connectivity status at a glance from the dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "Persistent sessions and protected endpoints keep your data safe.",
  },
  {
    icon: Zap,
    title: "Fast to insight",
    description:
      "Go from raw events to clear takeaways in minutes, not sprints.",
  },
];

const steps = [
  {
    icon: Database,
    title: "Connect your events",
    description:
      "Send product events to Logora through simple, protected endpoints.",
  },
  {
    icon: Sparkles,
    title: "Let AI analyze",
    description:
      "DeepSeek processes, groups, and summarizes your event stream.",
  },
  {
    icon: LineChart,
    title: "Act on insights",
    description: "Review clear takeaways and share them with your team.",
  },
];

const benefits = [
  "No complex event pipeline to maintain",
  "DeepSeek-powered summaries out of the box",
  "Persistent, secure sessions for every user",
];

const faqs = [
  {
    question: "What does Logora do?",
    answer:
      "Logora ingests product events, queues them reliably, and uses the DeepSeek model to turn that stream into clear, actionable analysis.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create an account, sign in to the dashboard, and start sending events through the protected API endpoints.",
  },
  {
    question: "Is my session persistent?",
    answer:
      "Yes. Sessions persist across page reloads with a secure, HTTP-only cookie and are validated against the backend on every request.",
  },
  {
    question: "Which AI model powers the analysis?",
    answer:
      "Logora currently uses DeepSeek, selectable from the dashboard settings menu.",
  },
];

const primaryLink =
  "inline-flex items-center justify-center gap-2 rounded-md bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-indigo-500 hover:to-violet-500";

const secondaryLink =
  "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />

      <header className="relative">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link href="/dashboard" className={primaryLink}>
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className={secondaryLink}>
                  Log in
                </Link>
                <Link href="/signup" className={primaryLink}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered event analytics
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Turn product events into clear insight
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Logora captures, analyzes, and summarizes your events with DeepSeek
            — so your team can move faster with confidence.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link href="/dashboard" className={primaryLink}>
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/signup" className={primaryLink}>
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className={secondaryLink}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            How it works
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            From raw events to clear takeaways in three steps.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <span className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-900">
                {title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Everything you need to understand your events
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            Purpose-built for product and growth teams that want answers, not
            more dashboards to build.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-900">
                {title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Built for teams, not just tools
            </h2>
            <p className="mt-3 text-sm text-zinc-500">
              Logora removes the busywork so you can focus on what the data is
              telling you.
            </p>

            <ul className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                  <span className="text-sm text-zinc-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-lg sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <p className="text-lg font-medium leading-relaxed">
                &ldquo;Logora turns the noisy firehose of product events into a
                clear, prioritized list of what actually matters.&rdquo;
              </p>
              <p className="mt-6 text-sm font-semibold">
                From raw events to action
              </p>
              <p className="text-xs text-indigo-100">The Logora promise</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            Quick answers before you get started.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-xl border border-zinc-200 bg-white p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-center text-white shadow-lg sm:p-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-100">
              Create an account to start tracking events and unlocking
              AI-powered insights.
            </p>
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              {user ? "Open dashboard" : "Create your account"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Logo />
          <p className="text-sm text-zinc-500">
            © Logora. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
