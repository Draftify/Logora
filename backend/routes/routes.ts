import {
  addEventController,
  getQueueStatsController,
} from "../controllers/events";
import { healthController } from "../controllers/health";

export type RouteHandler = (req: Request) => Response | Promise<Response>;

export const routes = [
  { method: "GET", path: "/health", handler: healthController },
  { method: "POST", path: "/events", handler: addEventController },
  { method: "GET", path: "/events", handler: getQueueStatsController },
] as const;
