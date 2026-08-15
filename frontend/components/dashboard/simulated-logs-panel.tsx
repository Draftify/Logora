"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RefreshCw, SquareTerminal, Trash2 } from "lucide-react";
import {
  enqueueEventAction,
  getSimulatedEventsAction,
} from "@/app/actions/dashboard";
import type { EventPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LogEntry {
  time: string;
  ok: boolean;
  service: string;
  event: string;
  data: string;
  jobId?: string;
  error?: string;
}

export function SimulatedLogsPanel() {
  const [events, setEvents] = useState<EventPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getSimulatedEventsAction();
        if (active) setEvents(data);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  async function handleSend() {
    if (sending) return;

    setSending(true);
    setLogs([]);

    for (const event of events) {
      const time = new Date().toLocaleTimeString();
      const res = await enqueueEventAction(event);

      setLogs((prev) => [
        ...prev,
        {
          time,
          ok: res.ok,
          service: event.service,
          event: event.event,
          data: JSON.stringify(event.data),
          jobId: res.jobId,
          error: res.error,
        },
      ]);

      await new Promise((resolve) => setTimeout(resolve, 90));
    }

    setSending(false);
  }

  function handleClear() {
    setLogs([]);
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-950 text-emerald-400 shadow-lg shadow-black/40 ring-1 ring-white/10">
            <SquareTerminal className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Live logs</h2>
            <p className="mt-0.5 text-sm text-zinc-400">
              Stream sample events into the pipeline
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#05070d] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="h-3 w-3 shrink-0 rounded-full bg-rose-500/90" />
            <span className="h-3 w-3 shrink-0 rounded-full bg-amber-500/90" />
            <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500/90" />
            <span className="ml-3 truncate font-mono text-xs text-zinc-500">
              simulated-events.log
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={sending || loading || events.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400 disabled:opacity-50"
            >
              {sending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {sending ? "Sending…" : "Send logs"}
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="max-h-96 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
        >
          {loading ? (
            <p className="text-zinc-500">
              <RefreshCw className="mr-2 inline h-3.5 w-3.5 animate-spin" />
              Loading simulated events…
            </p>
          ) : logs.length === 0 ? (
            <p className="text-zinc-500">
              <span className="text-emerald-400">➜</span>{" "}
              <span className="text-zinc-300">~</span> waiting — click{" "}
              <span className="text-emerald-300">Send logs</span> to stream the
              simulated events one by one
              <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-emerald-400/80 animate-blink" />
            </p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-zinc-600">{log.time}</span>
                  <span
                    className={cn(
                      "font-bold",
                      log.ok ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {log.ok ? "✓" : "✗"}
                  </span>
                  <span className="text-zinc-100">
                    {log.service}.{log.event}
                  </span>
                  {log.jobId ? (
                    <span className="text-zinc-600">→ job {log.jobId}</span>
                  ) : null}
                </div>

                {log.ok ? (
                  <div className="mt-0.5 break-all pl-7 text-zinc-500">
                    {log.data}
                  </div>
                ) : (
                  <div className="mt-0.5 pl-7 text-rose-400">{log.error}</div>
                )}
              </div>
            ))
          )}

          {sending ? (
            <p className="mt-2 text-zinc-500">
              Sending {logs.length}/{events.length}…
              <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-emerald-400/80 animate-blink" />
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
