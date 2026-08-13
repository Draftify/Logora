import type { SessionRecord } from "../schema/user.schema";
import { getSession } from "./user.service";

export interface AuthContext {
  session: SessionRecord;
  token: string;
}

// WeakMap so authenticated requests carry their context without mutating Request
const authStore = new WeakMap<Request, AuthContext>();

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;

  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1] ?? null;
}

export async function requireAuth(req: Request): Promise<boolean> {
  try {
    const token = extractBearerToken(req);
    if (!token) return false;

    const session = await getSession(token);
    if (!session) return false;

    authStore.set(req, { session, token });
    return true;
  } catch {
    return false;
  }
}

export function getAuthContext(req: Request): AuthContext | undefined {
  return authStore.get(req);
}
