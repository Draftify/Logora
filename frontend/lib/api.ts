const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9095";

/**
 * Server-side fetch helper for the Logora backend.
 * Used only from server components and server actions, so no CORS is involved.
 */
export async function backendFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
    signal: init?.signal ?? AbortSignal.timeout(10_000),
  });
}

export function backendUrl(): string {
  return BACKEND_URL;
}
