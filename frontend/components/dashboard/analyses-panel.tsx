"use client";

import { useEffect, useState } from "react";
import { Check, Inbox, RefreshCw, Trash2, Zap } from "lucide-react";
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Analyses</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {analyses.length} stored{" "}
            {analyses.length === 1 ? "analysis" : "analyses"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleFlush()}
            disabled={flushing}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            {flushing ? "Flushing…" : "Flush buffer"}
          </button>

          <button
            type="button"
            onClick={() => void handleClear()}
            disabled={clearing || analyses.length === 0}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 px-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {clearing ? "Clearing…" : "Clear all"}
          </button>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-50"
            aria-label="Refresh analyses"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading analyses…
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Inbox className="h-8 w-8 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-700">No analyses yet</p>
            <p className="text-xs text-zinc-500">
              Flush the buffer or run a sample analysis to get started.
            </p>
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
                  <span>{analysis.eventCount} events</span>
                  <span>•</span>
                  <span>{new Date(analysis.createdAt).toLocaleString()}</span>
                  {analysis.read ? (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                      Read
                    </span>
                  ) : (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
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
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50"
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
