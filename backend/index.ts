import { config } from "./config/config";
import { logger } from "./logger/logger";
import { routes } from "./routes/routes";

const server = Bun.serve({
  port: config.port,

  fetch(req) {
    const url = new URL(req.url);
    const route = routes.find((r) => r.path === url.pathname);
    if (route) {
      return route.handler();
    }
    return new Response("Route not found", {
      status: 404,
    });
  },
});

logger.info(
  `Logora started on ${server.hostname}:${server.port} and running on ${config.nodeEnv} environment`,
);
