import { connection } from "../lib/queue";

export async function healthController() {
  try {
    await connection.ping();

    return Response.json({
      status: "healthy",
      redis: "connected",
    });
  } catch {
    return Response.json(
      {
        status: "unhealthy",
        redis: "disconnected",
      },
      { status: 503 },
    );
  }
}
