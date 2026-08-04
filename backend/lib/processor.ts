import { Worker } from "bullmq";

import { connection, eventQueue } from "../lib/queue";
import { logger } from "../logger/logger";
import type { EventPayload } from "../schema/event.schema";

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

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
  {
    connection: connection.duplicate(),
    concurrency: 5,
  },
);

eventWorker.on("failed", (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      error: error.message,
    },
    "Job failed",
  );
});

logger.info("Event worker started");
