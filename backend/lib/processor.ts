import { Worker } from "bullmq";

import {
  connection,
  eventQueue,
  incrementCompletedCounter,
  incrementFailedCounter,
} from "../lib/queue";
import { logger } from "../logger/logger";
import type { EventPayload } from "../schema/event.schema";
import { pushToBuffer, bufferLength } from "./analysis.store";
import { flushBuffer, BATCH_SIZE } from "./batch.analyzer";

let flushing = false;

async function flushIfFull(): Promise<void> {
  if (flushing) return;

  const queued = await bufferLength();
  if (queued < BATCH_SIZE) return;

  flushing = true;
  try {
    await flushBuffer();
  } finally {
    flushing = false;
  }
}

export const eventWorker = new Worker<EventPayload>(
  eventQueue.name,
  async (job) => {
    logger.info(
      {
        jobId: job.id,
        service: job.data.service,
        event: job.data.event,
      },
      "Processing event",
    );

    await pushToBuffer(job.data);

    logger.info({ jobId: job.id }, "Event pushed to analysis buffer");

    await flushIfFull();
  },
  {
    connection: connection.duplicate(),
    concurrency: 5,
  },
);

eventWorker.on("completed", () => {
  void incrementCompletedCounter();
});

eventWorker.on("failed", (job, error) => {
  void incrementFailedCounter();

  logger.error(
    {
      jobId: job?.id,
      error: error.message,
    },
    "Job failed",
  );
});

logger.info("Event worker started");
