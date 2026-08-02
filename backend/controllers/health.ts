import { isRedisHealthy } from "../lib/redis";

export const healthController = async () => {
  const redisHealthy = await isRedisHealthy();

  if (!redisHealthy) {
    return Response.json(
      {
        message: "Backend is unhealthy",
        redis: "disconnected",
      },
      {
        status: 503,
      },
    );
  }

  return Response.json({
    message: "Backend is healthy",
    redis: "connected",
  });
};
