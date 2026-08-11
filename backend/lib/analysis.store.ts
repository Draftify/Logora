import { connection } from "./queue";
import { logger } from "../logger/logger";
import type { Analysis } from "../schema/analyze.schema";
import type { StoredAnalysis } from "../schema/analysis.store.schema";

const LIST_KEY = "analyses:list";
const BUFFER_KEY = "events:buffer";

function analysisKey(id: string) {
  return `analysis:${id}`;
}

/* ── Buffer ─────────────────────────────────────────────── */

export async function pushToBuffer(event: unknown): Promise<number> {
  return connection.rpush(BUFFER_KEY, JSON.stringify(event));
}

export async function popBuffer(count: number): Promise<unknown[]> {
  const items: string[] = [];
  for (let i = 0; i < count; i++) {
    const item = await connection.lpop(BUFFER_KEY);
    if (!item) break;
    items.push(item);
  }
  return items.map((i) => JSON.parse(i) as unknown);
}

export async function bufferLength(): Promise<number> {
  return connection.llen(BUFFER_KEY);
}

/* ── Analysis CRUD ─────────────────────────────────────── */

export async function storeAnalysis(
  analysis: Analysis,
  eventCount: number,
): Promise<StoredAnalysis> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const record: StoredAnalysis = {
    id,
    summary: analysis.summary,
    insights: analysis.insights,
    risks: analysis.risks,
    recommendations: analysis.recommendations,
    eventCount,
    createdAt,
    read: false,
  };

  await connection
    .multi()
    .hset(analysisKey(id), {
      id: record.id,
      summary: record.summary,
      insights: JSON.stringify(record.insights),
      risks: JSON.stringify(record.risks),
      recommendations: JSON.stringify(record.recommendations),
      eventCount: String(record.eventCount),
      createdAt: record.createdAt,
      read: "false",
    })
    .zadd(LIST_KEY, Date.now(), id)
    .exec();

  logger.info({ analysisId: id, eventCount }, "Analysis stored");

  return record;
}

export async function listAnalyses(): Promise<StoredAnalysis[]> {
  const ids = await connection.zrevrange(LIST_KEY, 0, -1);
  if (ids.length === 0) return [];

  const pipeline = connection.pipeline();
  for (const id of ids) {
    pipeline.hgetall(analysisKey(id));
  }

  const results = (await pipeline.exec()) ?? [];
  const analyses: StoredAnalysis[] = [];

  for (const item of results) {
    const err = item[0];
    const raw = item[1] as Record<string, string> | null | undefined;

    if (err || !raw || Object.keys(raw).length === 0) continue;

    analyses.push(hydrateAnalysis(raw));
  }

  return analyses;
}

export async function markAsRead(analysisId: string): Promise<boolean> {
  const exists = await connection.exists(analysisKey(analysisId));
  if (!exists) return false;

  await connection.hset(analysisKey(analysisId), "read", "true");
  return true;
}

export async function clearAnalyses(): Promise<number> {
  const ids = await connection.zrange(LIST_KEY, "0", "-1");
  if (ids.length === 0) return 0;

  const pipeline = connection.pipeline();
  for (const id of ids) {
    pipeline.del(analysisKey(id));
  }
  pipeline.del(LIST_KEY);
  await pipeline.exec();

  logger.info({ count: ids.length }, "All analyses cleared");

  return ids.length;
}

/* ── Helpers ────────────────────────────────────────────── */

function hydrateAnalysis(raw: Record<string, string>): StoredAnalysis {
  return {
    id: raw.id!,
    summary: raw.summary!,
    insights: (safeJson(raw.insights) as string[]) ?? [],
    risks: (safeJson(raw.risks) as StoredAnalysis["risks"]) ?? [],
    recommendations: (safeJson(raw.recommendations) as string[]) ?? [],
    eventCount: Number(raw.eventCount) || 0,
    createdAt: raw.createdAt!,
    read: raw.read === "true",
  };
}

function safeJson(raw: string | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
