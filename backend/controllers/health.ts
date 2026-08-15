import { connection } from "../lib/queue";

function toMegabytes(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export async function healthController() {
  const memory = process.memoryUsage();
  const serverMetrics = {
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rssMb: toMegabytes(memory.rss),
      heapUsedMb: toMegabytes(memory.heapUsed),
    },
  };

  try {
    await connection.ping();

    return Response.json({
      status: "healthy",
      redis: "connected",
      ...serverMetrics,
    });
  } catch {
    return Response.json(
      {
        status: "unhealthy",
        redis: "disconnected",
        ...serverMetrics,
      },
      { status: 503 },
    );
  }
}
