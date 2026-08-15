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
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 sm:px-3"
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          health === null
            ? "bg-zinc-300"
            : healthy
              ? "bg-emerald-500"
              : "bg-red-500",
        )}
      />
      <span className="hidden sm:inline">
        {health === null ? "Checking…" : healthy ? "Healthy" : "Offline"}
      </span>
    </span>
  );
}
