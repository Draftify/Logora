"use client";

import { useState } from "react";
import { Play, RefreshCw } from "lucide-react";
import { analyzeSampleAction } from "@/app/actions/dashboard";
import type { Analysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AnalysisCard } from "./analysis-card";

export function AnalysisPlayground() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeSampleAction();
      if (res.ok && res.analysis) {
        setResult(res.analysis);
      } else {
        setError(res.error ?? "Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">
        Analyze sample events
      </h2>
      <p className="mt-0.5 text-xs text-zinc-500">
        Run DeepSeek over the bundled sample dataset.
      </p>

      <Button
        onClick={() => void handleAnalyze()}
        disabled={loading}
        className="mt-4 w-full"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Run analysis
          </>
        )}
      </Button>

      {error ? (
        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4">
          <AnalysisCard
            summary={result.summary}
            insights={result.insights}
            risks={result.risks}
            recommendations={result.recommendations}
          />
        </div>
      ) : null}
    </div>
  );
}
