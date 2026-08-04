import {
  addEventController,
  getQueueStatsController,
} from "../controllers/events";
import { getSimulatedDataController } from "../controllers/data";
import { healthController } from "../controllers/health";

export type RouteHandler = (req: Request) => Response | Promise<Response>;

export const routes = [
  { method: "GET", path: "/health", handler: healthController },
  { method: "POST", path: "/events", handler: addEventController },
  { method: "GET", path: "/events", handler: getQueueStatsController },
  {
    method: "GET",
    path: "/simulated-data",
    handler: getSimulatedDataController,
  },
] as const;
