"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  HeartPulse,
  RefreshCw,
  Server,
  Timer,
} from "lucide-react";
import { getServerMetricsAction } from "@/app/actions/dashboard";
import type { ServerHealth } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatUptime(seconds?: number): string {
  if (seconds == null) return "—";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface Stat {
  label: string;
  value: string;
  icon: typeof Server;
  tone: string;
}

export function HealthPanel() {
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getServerMetricsAction();
        if (active) setHealth(data);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const healthy = health?.status === "healthy";
  const redisConnected = health?.redis === "connected";

  const stats: Stat[] = [
    {
      label: "Backend",
      value: healthy ? "Healthy" : "Unhealthy",
      icon: Server,
      tone: healthy
        ? "from-emerald-400/20 to-emerald-500/5 text-emerald-300 ring-emerald-400/30"
        : "from-rose-400/20 to-rose-500/5 text-rose-300 ring-rose-400/30",
    },
    {
      label: "Redis",
      value: redisConnected ? "Connected" : "Disconnected",
      icon: HardDrive,
      tone: redisConnected
        ? "from-emerald-400/20 to-emerald-500/5 text-emerald-300 ring-emerald-400/30"
        : "from-rose-400/20 to-rose-500/5 text-rose-300 ring-rose-400/30",
    },
    {
      label: "Uptime",
      value: formatUptime(health?.uptimeSeconds),
      icon: Timer,
      tone: "from-sky-400/20 to-sky-500/5 text-sky-300 ring-sky-400/30",
    },
    {
      label: "Memory",
      value: health?.memory
        ? `${health.memory.rssMb} MB RSS · ${health.memory.heapUsedMb} MB heap`
        : "—",
      icon: Cpu,
      tone: "from-violet-400/20 to-violet-500/5 text-violet-300 ring-violet-400/30",
    },
  ];

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/50">
            <HeartPulse className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Health</h2>
            <p className="mt-0.5 text-sm text-zinc-400">
              Backend and infrastructure status
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
            loading
              ? "border-white/10 bg-white/5 text-zinc-400"
              : healthy
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "border-rose-400/20 bg-rose-400/10 text-rose-300",
          )}
        >
          <span className="relative flex h-2 w-2">
            {!loading ? (
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full animate-ping-ring",
                  healthy ? "bg-emerald-400" : "bg-rose-400",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                loading
                  ? "bg-zinc-500"
                  : healthy
                    ? "bg-emerald-400"
                    : "bg-rose-400",
              )}
            />
          </span>
          {loading ? "Checking…" : healthy ? "Operational" : "Degraded"}
        </span>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-5"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton mt-4 h-3 w-16 rounded" />
              <div className="skeleton mt-3 h-6 w-28 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }, index) => (
            <div
              key={label}
              className="group rounded-2xl glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 animate-fade-up"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset bg-linear-to-br",
                  tone,
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {label}
              </p>
              <p className="mt-1.5 text-lg font-semibold leading-snug text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-sm text-zinc-400">
        <Activity className="h-4 w-4 shrink-0 text-zinc-500" />
        <span>
          Health checks run against the Logora backend and its Redis connection.{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 text-indigo-300 transition-colors hover:text-indigo-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </span>
      </div>
    </div>
  );
}
