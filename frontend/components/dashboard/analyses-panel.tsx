"use client";

import { useEffect, useState } from "react";
import { Check, Inbox, RefreshCw, Sparkles, Trash2, Zap } from "lucide-react";
import {
  clearAnalysesAction,
  flushAction,
  getAnalysesAction,
  markReadAction,
} from "@/app/actions/dashboard";
import type { StoredAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnalysisCard } from "./analysis-card";

export function AnalysesPanel() {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [flushing, setFlushing] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getAnalysesAction();
        if (active) setAnalyses(data);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function load() {
    const data = await getAnalysesAction();
    setAnalyses(data);
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleMarkRead(id: string) {
    setBusyId(id);
    try {
      await markReadAction(id);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleClear() {
    setClearing(true);
    try {
      await clearAnalysesAction();
      await load();
    } finally {
      setClearing(false);
    }
  }

  async function handleFlush() {
    setFlushing(true);
    try {
      await flushAction();
      await load();
    } finally {
      setFlushing(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/50">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Analyses</h2>
            <p className="mt-0.5 text-sm text-zinc-400">
              AI-generated insights ·{" "}
              <span className="font-medium text-zinc-200">
                {analyses.length}
              </span>{" "}
              {analyses.length === 1 ? "analysis" : "analyses"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleFlush()}
            disabled={flushing}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 px-3.5 text-xs font-semibold text-white shadow-lg shadow-indigo-950/40 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            {flushing ? "Flushing…" : "Flush buffer"}
          </button>

          <button
            type="button"
            onClick={() => void handleClear()}
            disabled={clearing || analyses.length === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-400/25 px-3 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {clearing ? "Clearing…" : "Clear all"}
          </button>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
            aria-label="Refresh analyses"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-5"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton mt-4 h-3 w-1/2 rounded" />
                <div className="skeleton mt-3 h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500/20 to-violet-600/10 text-indigo-300 ring-1 ring-indigo-400/20">
              <Inbox className="h-7 w-7" />
              <span className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-pulse-glow blur-xl" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                No analyses yet
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Flush the buffer or run a sample analysis to get started.
              </p>
            </div>
          </div>
        ) : (
          analyses.map((analysis) => (
            <AnalysisCard
              key={analysis.id}
              summary={analysis.summary}
              insights={analysis.insights}
              risks={analysis.risks}
              recommendations={analysis.recommendations}
              meta={
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-full bg-white/5 px-2.5 py-1 font-medium text-zinc-300">
                    {analysis.eventCount} events
                  </span>
                  <span>•</span>
                  <span>{new Date(analysis.createdAt).toLocaleString()}</span>
                  {analysis.read ? (
                    <span className="rounded-full bg-white/5 px-2.5 py-1 font-medium text-zinc-400">
                      Read
                    </span>
                  ) : (
                    <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 font-medium text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
                      Unread
                    </span>
                  )}
                </div>
              }
              actions={
                analysis.read ? null : (
                  <button
                    type="button"
                    onClick={() => void handleMarkRead(analysis.id)}
                    disabled={busyId === analysis.id}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {busyId === analysis.id ? "Marking…" : "Mark read"}
                  </button>
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
