"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  XCircle,
} from "lucide-react";
import {
  getAnalysesAction,
  getQueueStatsAction,
} from "@/app/actions/dashboard";
import type { QueueStats, StoredAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

function useCountUp(target: number | undefined, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function miniBars(seed: number) {
  return Array.from({ length: 9 }, (_, i) => {
    const v = Math.abs(Math.sin((seed + i) * 1.71)) * 0.7 + 0.15;
    return Math.round(v * 100);
  });
}

interface Kpi {
  label: string;
  value?: number;
  icon: ComponentType<{ className?: string }>;
  chip: string;
  bar: string;
  seed: number;
}

function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const animated = useCountUp(kpi.value);
  const Icon = kpi.icon;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_24px_60px_-24px_rgba(99,102,241,0.5)] animate-fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-linear-to-br from-indigo-500/20 to-fuchsia-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset bg-linear-to-br",
            kpi.chip,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex h-8 items-end gap-1">
          {miniBars(kpi.seed).map((height, i) => (
            <span
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-300 group-hover:opacity-100",
                kpi.bar,
                i % 2 === 0 ? "opacity-70" : "opacity-40",
              )}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {kpi.label}
      </p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-white tabular-nums">
        {kpi.value == null ? "—" : animated.toLocaleString()}
      </p>
    </div>
  );
}

export function MetricsOverview() {
  const [queue, setQueue] = useState<QueueStats | null>(null);
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [queueData, analysesData] = await Promise.all([
          getQueueStatsAction(),
          getAnalysesAction(),
        ]);

        if (active) {
          setQueue(queueData);
          setAnalyses(analysesData);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const eventsAnalyzed = analyses.reduce(
    (sum, analysis) => sum + analysis.eventCount,
    0,
  );

  const kpis: Kpi[] = [
    {
      label: "Queued",
      value: queue?.waiting,
      icon: Clock,
      chip: "from-amber-400/20 to-amber-500/5 text-amber-300 ring-amber-400/30",
      bar: "bg-amber-400",
      seed: 2,
    },
    {
      label: "In progress",
      value: queue?.active,
      icon: Activity,
      chip: "from-indigo-400/20 to-indigo-500/5 text-indigo-300 ring-indigo-400/30",
      bar: "bg-indigo-400",
      seed: 5,
    },
    {
      label: "Completed",
      value: queue?.completed,
      icon: CheckCircle2,
      chip: "from-emerald-400/20 to-emerald-500/5 text-emerald-300 ring-emerald-400/30",
      bar: "bg-emerald-400",
      seed: 8,
    },
    {
      label: "Failed",
      value: queue?.failed,
      icon: XCircle,
      chip: "from-rose-400/20 to-rose-500/5 text-rose-300 ring-rose-400/30",
      bar: "bg-rose-400",
      seed: 11,
    },
    {
      label: "Analyses",
      value: analyses.length,
      icon: BarChart3,
      chip: "from-violet-400/20 to-violet-500/5 text-violet-300 ring-violet-400/30",
      bar: "bg-violet-400",
      seed: 14,
    },
    {
      label: "Events analyzed",
      value: eventsAnalyzed,
      icon: Database,
      chip: "from-sky-400/20 to-sky-500/5 text-sky-300 ring-sky-400/30",
      bar: "bg-sky-400",
      seed: 17,
    },
  ];

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Metrics</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Live telemetry for your event pipeline
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-5 animate-fade-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton mt-4 h-3 w-16 rounded" />
              <div className="skeleton mt-3 h-7 w-20 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi, index) => (
            <KpiCard key={kpi.label} kpi={kpi} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
