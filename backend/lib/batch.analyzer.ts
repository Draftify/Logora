import { analyzeEvents } from "./analyzer";
import { popBuffer, bufferLength, storeAnalysis } from "./analysis.store";
import { logger } from "../logger/logger";

export const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 10_000; // safety net: flush any stragglers periodically

export async function flushBuffer(): Promise<void> {
  const queued = await bufferLength();
  if (queued === 0) return;

  const count = Math.min(queued, 200);
  const events = await popBuffer(count);

  if (events.length === 0) return;

  logger.info({ eventCount: events.length }, "Flushing buffer for analysis");

  try {
    const analysis = await analyzeEvents(events as any);
    const stored = await storeAnalysis(analysis, events.length);

    logger.info(
      {
        analysisId: stored.id,
        eventCount: events.length,
        summary: stored.summary,
        riskCount: stored.risks.length,
        insightCount: stored.insights.length,
      },
      "AI analysis completed",
    );
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Batch analysis failed",
    );
  }
}

export function startBatchScheduler(abort: AbortSignal): void {
  let timer: ReturnType<typeof setInterval>;

  const run = async () => {
    await flushBuffer();
  };

  timer = setInterval(run, FLUSH_INTERVAL_MS);

  abort.addEventListener("abort", () => {
    clearInterval(timer);
  });

  logger.info(
    { batchSize: BATCH_SIZE, intervalMs: FLUSH_INTERVAL_MS },
    "Batch analysis scheduler started",
  );
}
