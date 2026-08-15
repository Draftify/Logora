"use server";

import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/api";
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from "@/lib/session";

export interface AuthFormState {
  error?: string;
}

const NETWORK_ERROR =
  "Can't reach the Logora server. Make sure the backend is running, then try again.";

function getErrorMessage(data: unknown): string {
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

async function post(path: string, body: Record<string, unknown>) {
  try {
    return await backendFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(NETWORK_ERROR);
  }
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let res: Response;
  try {
    res = await post("/auth/login", { email, password });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR,
    };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: getErrorMessage(data) };
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    return { error: "Failed to start a session. Please try again." };
  }

  await setSessionToken(data.token);
  redirect("/dashboard");
}

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let res: Response;
  try {
    res = await post("/auth/signup", { email, password });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR,
    };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: getErrorMessage(data) };
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    return { error: "Failed to start a session. Please try again." };
  }

  await setSessionToken(data.token);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();

  if (token) {
    try {
      await backendFetch("/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Even if the backend is unreachable, clear the local session below.
    }
  }

  await clearSessionToken();
  redirect("/login");
}
