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
  AgentMessage,
  EventPayload,
  QueueStats,
  ServerHealth,
  StoredAnalysis,
  UserRecord,
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

function messageFrom(data: unknown): string {
  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.length > 0) {
      return record.message;
    }

    const fieldErrors = record.fieldErrors as
      | Record<string, string[]>
      | undefined;
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).flat()[0]
      : undefined;

    if (firstFieldError) return firstFieldError;
  }

  return "Something went wrong. Please try again.";
}

export async function sendAgentMessageAction(
  message: string,
  history: AgentMessage[],
): Promise<{ reply?: string; error?: string }> {
  try {
    const res = await authenticatedFetch("/agent/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: messageFrom(data) };
    }

    const data = (await res.json()) as { reply?: string };
    return { reply: data.reply ?? "" };
  } catch {
    return { error: "Can't reach the agent right now. Please try again." };
  }
}

export async function listUsersAction(): Promise<UserRecord[]> {
  try {
    const res = await authenticatedFetch("/users");
    if (!res.ok) return [];

    const data = (await res.json()) as { users?: UserRecord[] };
    return data.users ?? [];
  } catch {
    return [];
  }
}

export async function addUserAction(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch("/users", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { ok: false, error: messageFrom(data) };
    }

    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "Can't reach the server right now." };
  }
}

export async function removeUserAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(
      `/users?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { ok: false, error: messageFrom(data) };
    }

    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "Can't reach the server right now." };
  }
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
