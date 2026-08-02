import Redis from "ioredis";

import { config } from "../config/config";
import { logger } from "../logger/logger";

const PING_TIMEOUT_MS = 2_000;

export const redis = new Redis(config.redisUrl, {
  connectionName: "logora",
  connectTimeout: 5_000,
  maxRetriesPerRequest: 2,
  password: config.redisPassword,
});

redis.on("connect", () => {
  logger.info("Redis connection established");
});

redis.on("ready", () => {
  logger.info("Redis is ready");
});

redis.on("reconnecting", () => {
  logger.warn("Redis connection lost, reconnecting…");
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

let lastLoggedError: string | undefined;

redis.on("error", (error) => {
  // ioredis retries forever, so the same error repeats on every attempt.
  // Log each distinct error only once until it changes.
  if (error.message === lastLoggedError) return;
  lastLoggedError = error.message;

  const isConnectionError =
    (error as { code?: string }).code === "ECONNREFUSED";

  if (isConnectionError) {
    logger.warn(
      { error: error.message },
      "Redis connection attempt failed, retrying…",
    );
  } else {
    logger.error({ error: error.message }, "Redis error");
  }
});

export async function isRedisHealthy(): Promise<boolean> {
  try {
    const pong = await Promise.race([
      redis.ping(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(`Redis ping timed out after ${PING_TIMEOUT_MS}ms`),
            ),
          PING_TIMEOUT_MS,
        );
      }),
    ]);

    return pong === "PONG";
  } catch {
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
