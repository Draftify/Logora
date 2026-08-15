import { backendFetch } from "./api";
import { getSessionToken } from "./session";
import type {
  EventPayload,
  QueueStats,
  ServerHealth,
  StoredAnalysis,
} from "./types";

/**
 * Server-side fetch helper that attaches the current session's bearer token.
 * Use only from server components and server actions.
 */
export async function authenticatedFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getSessionToken();

  return backendFetch(path, {
    ...init,
    headers: {
      ...init?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function fetchAnalyses(): Promise<StoredAnalysis[]> {
  try {
    const res = await authenticatedFetch("/analysis");
    if (!res.ok) return [];
    return (await res.json()) as StoredAnalysis[];
  } catch {
    return [];
  }
}

export async function fetchQueueStats(): Promise<QueueStats | null> {
  try {
    const res = await authenticatedFetch("/events");
    if (!res.ok) return null;
    return (await res.json()) as QueueStats;
  } catch {
    return null;
  }
}

export async function fetchSimulatedEvents(): Promise<EventPayload[]> {
  try {
    const res = await authenticatedFetch("/simulated-data");
    if (!res.ok) return [];
    return (await res.json()) as EventPayload[];
  } catch {
    return [];
  }
}

export async function fetchServerHealth(): Promise<ServerHealth | null> {
  try {
    const res = await authenticatedFetch("/health");
    const data = (await res.json().catch(() => null)) as ServerHealth | null;
    return data;
  } catch {
    return null;
  }
}
