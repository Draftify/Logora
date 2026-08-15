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

// BullMQ caps the `completed`/`failed` job counts it retains in Redis
// (`removeOnComplete: 100`), so those values never reflect the true totals.
// We keep our own cumulative counters to surface meaningful numbers.
const COMPLETED_COUNTER_KEY = "stats:completed";
const FAILED_COUNTER_KEY = "stats:failed";

export async function incrementCompletedCounter() {
  return connection.incr(COMPLETED_COUNTER_KEY);
}

export async function incrementFailedCounter() {
  return connection.incr(FAILED_COUNTER_KEY);
}

export async function getEventQueueCounts() {
  const [live, completed, failed] = await Promise.all([
    eventQueue.getJobCounts("waiting", "active", "delayed"),
    connection.get(COMPLETED_COUNTER_KEY),
    connection.get(FAILED_COUNTER_KEY),
  ]);

  return {
    waiting: live.waiting ?? 0,
    active: live.active ?? 0,
    delayed: live.delayed ?? 0,
    completed: Number(completed ?? "0"),
    failed: Number(failed ?? "0"),
  };
}
