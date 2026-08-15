"use server";

import { revalidatePath } from "next/cache";
import {
  authenticatedFetch,
  fetchAnalyses,
  fetchQueueStats,
  fetchServerHealth,
  fetchSimulatedEvents,
} from "@/lib/dashboard";
import type {
  Analysis,
  QueueStats,
  ServerHealth,
  StoredAnalysis,
} from "@/lib/types";

export async function getAnalysesAction(): Promise<StoredAnalysis[]> {
  return fetchAnalyses();
}

export async function getQueueStatsAction(): Promise<QueueStats | null> {
  return fetchQueueStats();
}

export async function getServerMetricsAction(): Promise<ServerHealth | null> {
  return fetchServerHealth();
}

export async function markReadAction(id: string): Promise<void> {
  try {
    await authenticatedFetch("/analysis/read", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
  } catch {
    // The UI reloads data and will surface any failure through that reload.
  }

  revalidatePath("/dashboard");
}

export async function clearAnalysesAction(): Promise<void> {
  try {
    await authenticatedFetch("/analysis", { method: "DELETE" });
  } catch {
    // The UI reloads data and will surface any failure through that reload.
  }

  revalidatePath("/dashboard");
}

export async function flushAction(): Promise<void> {
  try {
    await authenticatedFetch("/analysis/flush", { method: "POST" });
  } catch {
    // The UI reloads data and will surface any failure through that reload.
  }

  revalidatePath("/dashboard");
}

export interface AnalyzeResult {
  ok: boolean;
  analysis?: Analysis;
  error?: string;
}

export async function analyzeSampleAction(): Promise<AnalyzeResult> {
  try {
    const events = await fetchSimulatedEvents();
    if (events.length === 0) {
      return { ok: false, error: "No sample events are available." };
    }

    const res = await authenticatedFetch("/events/analyze", {
      method: "POST",
      body: JSON.stringify({ events }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message?: unknown }).message)
          : "Analysis failed. Please try again.";

      return { ok: false, error: message };
    }

    return { ok: true, analysis: (await res.json()) as Analysis };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Analysis failed. Please try again.",
    };
  }
}
