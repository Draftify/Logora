"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Health {
  status: "healthy" | "unhealthy";
  redis?: string;
}

const POLL_INTERVAL_MS = 30_000;

export function HealthIndicator() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = (await res.json()) as Health;
        if (active) setHealth(data);
      } catch {
        if (active) setHealth({ status: "unhealthy", redis: "disconnected" });
      }
    }

    check();
    const id = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const healthy = health?.status === "healthy";

  return (
    <span
      title={
        health ? `Redis: ${health.redis ?? "unknown"}` : "Checking backend"
      }
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        health === null
          ? "border-white/10 bg-white/5 text-zinc-400"
          : healthy
            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
            : "border-rose-400/20 bg-rose-400/10 text-rose-300",
      )}
    >
      <span className="relative flex h-2 w-2">
        {health !== null ? (
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
            health === null
              ? "bg-zinc-500"
              : healthy
                ? "bg-emerald-400"
                : "bg-rose-400",
          )}
        />
      </span>
      <span className="hidden sm:inline">
        {health === null ? "Checking…" : healthy ? "Healthy" : "Offline"}
      </span>
    </span>
  );
}
