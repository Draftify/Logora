import { config } from "./config/config";
import { logger } from "./logger/logger";
import { routes } from "./routes/routes";
import { eventQueue } from "./lib/queue";
import { eventWorker } from "./lib/processor";
import { startBatchScheduler } from "./lib/batch.analyzer";
import { requireAuth } from "./lib/auth";

const abortController = new AbortController();

const server = Bun.serve({
  port: config.port,

  async fetch(req) {
    const url = new URL(req.url);
    const route = routes.find(
      (r) => r.path === url.pathname && r.method === req.method,
    );

    if (!route) {
      return new Response("Route not found", { status: 404 });
    }

    if ("auth" in route && route.auth) {
      const authorized = await requireAuth(req);

      if (!authorized) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    return route.handler(req);
  },
});

logger.info(
  `Logora started on ${server.hostname}:${server.port} (${config.nodeEnv})`,
);

startBatchScheduler(abortController.signal);

async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");

  abortController.abort();
  await eventWorker.close();
  await eventQueue.close();

  process.exit(0);
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.once(signal, () => void shutdown(signal));
});
