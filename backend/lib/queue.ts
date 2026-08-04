import { Queue } from "bullmq";
import Redis from "ioredis";

import { config } from "../config/config";
import { eventSchema, type EventPayload } from "../schema/event.schema";

export const connection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  password: config.redisPassword,
});

export const eventQueue = new Queue<EventPayload>("event-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

export async function addEventJob(payload: unknown) {
  const data = eventSchema.parse(payload);
  const job = await eventQueue.add("process-event", data);

  return { jobId: job.id };
}

export function getEventQueueCounts() {
  return eventQueue.getJobCounts(
    "waiting",
    "active",
    "delayed",
    "completed",
    "failed",
  );
}
