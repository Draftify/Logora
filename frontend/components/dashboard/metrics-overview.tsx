"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Timer,
  XCircle,
} from "lucide-react";
import {
  getAnalysesAction,
  getQueueStatsAction,
  getServerMetricsAction,
} from "@/app/actions/dashboard";
import type { QueueStats, ServerHealth, StoredAnalysis } from "@/lib/types";
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

interface ServerMetricProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  ok?: boolean;
}

function ServerMetric({ label, value, icon: Icon, ok }: ServerMetricProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-zinc-400" />
      <span className="text-zinc-500">{label}</span>
      <span
        className={cn(
          "font-medium",
          ok === undefined
            ? "text-zinc-900"
            : ok
              ? "text-emerald-600"
              : "text-red-600",
        )}
      >
        {value}
      </span>
      {ok !== undefined ? (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            ok ? "bg-emerald-500" : "bg-red-500",
          )}
        />
      ) : null}
    </div>
  );
}

export function MetricsOverview() {
  const [queue, setQueue] = useState<QueueStats | null>(null);
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [queueData, analysesData, healthData] = await Promise.all([
          getQueueStatsAction(),
          getAnalysesAction(),
          getServerMetricsAction(),
        ]);

        if (active) {
          setQueue(queueData);
          setAnalyses(analysesData);
          setHealth(healthData);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white p-10 text-sm text-zinc-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Loading metrics…
      </div>
    );
  }

  const eventsAnalyzed = analyses.reduce(
    (sum, analysis) => sum + analysis.eventCount,
    0,
  );

  const backendHealthy = health?.status === "healthy";
  const redisConnected = health?.redis === "connected";

  const kpis = [
    {
      label: "Queued",
      value: queue?.waiting,
      icon: Clock,
      accent: "text-amber-600",
    },
    {
      label: "In progress",
      value: queue?.active,
      icon: Activity,
      accent: "text-indigo-600",
    },
    {
      label: "Completed",
      value: queue?.completed,
      icon: CheckCircle2,
      accent: "text-emerald-600",
    },
    {
      label: "Failed",
      value: queue?.failed,
      icon: XCircle,
      accent: "text-red-600",
    },
    {
      label: "Analyses",
      value: analyses.length,
      icon: BarChart3,
      accent: "text-violet-600",
    },
    {
      label: "Events analyzed",
      value: eventsAnalyzed,
      icon: Database,
      accent: "text-blue-600",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">Overview</h2>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-zinc-100 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="bg-white px-5 py-4">
            <div className="flex items-center gap-1.5">
              <Icon className={cn("h-4 w-4", accent)} />
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {label}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
              {value == null ? "—" : value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-100 px-5 py-4">
        <ServerMetric
          label="Backend"
          value={backendHealthy ? "Healthy" : "Unhealthy"}
          ok={backendHealthy}
          icon={Server}
        />
        <ServerMetric
          label="Redis"
          value={redisConnected ? "Connected" : "Disconnected"}
          ok={redisConnected}
          icon={HardDrive}
        />
        <ServerMetric
          label="Uptime"
          value={formatUptime(health?.uptimeSeconds)}
          icon={Timer}
        />
        <ServerMetric
          label="Memory"
          value={
            health?.memory
              ? `${health.memory.rssMb} MB RSS · ${health.memory.heapUsedMb} MB heap`
              : "—"
          }
          icon={Cpu}
        />
      </div>
    </div>
  );
}
