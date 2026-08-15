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
  EventPayload,
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

export async function getSimulatedEventsAction(): Promise<EventPayload[]> {
  return fetchSimulatedEvents();
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

export interface EnqueueEventResult {
  ok: boolean;
  jobId?: string;
  error?: string;
}

export async function enqueueEventAction(
  event: EventPayload,
): Promise<EnqueueEventResult> {
  try {
    const res = await authenticatedFetch("/events", {
      method: "POST",
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message?: unknown }).message)
          : "Failed to enqueue event.";

      return { ok: false, error: message };
    }

    const data = (await res.json()) as { jobId?: string };
    return { ok: true, jobId: data.jobId };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to enqueue event.",
    };
  }
}
