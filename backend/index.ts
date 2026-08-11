import { config } from "./config/config";
import { logger } from "./logger/logger";
import { routes } from "./routes/routes";
import { eventQueue } from "./lib/queue";
import { eventWorker } from "./lib/processor";
import { startBatchScheduler } from "./lib/batch.analyzer";

const abortController = new AbortController();

const server = Bun.serve({
  port: config.port,

  fetch(req) {
    const url = new URL(req.url);
    const route = routes.find(
      (r) => r.path === url.pathname && r.method === req.method,
    );

    return route
      ? route.handler(req)
      : new Response("Route not found", { status: 404 });
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
