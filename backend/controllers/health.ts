import { db } from "../lib/db";

export const healthController = async () => {
  try {
    await db.ping();

    return Response.json({
      message: "Backend is healthy",
      database: "connected",
    });
  } catch {
    return Response.json(
      {
        message: "Backend is unhealthy",
        database: "disconnected",
      },
      {
        status: 503,
      },
    );
  }
};
