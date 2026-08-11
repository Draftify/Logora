import {
  addEventController,
  getQueueStatsController,
} from "../controllers/events";
import { analyzeEventsController } from "../controllers/analyze";
import { getSimulatedDataController } from "../controllers/data";
import { healthController } from "../controllers/health";
import { signupController, loginController } from "../controllers/auth";
import {
  listAnalysesController,
  markReadController,
  clearAnalysesController,
  flushNowController,
} from "../controllers/analysis";

export type RouteHandler = (req: Request) => Response | Promise<Response>;

export const routes = [
  { method: "GET", path: "/health", handler: healthController },
  { method: "POST", path: "/auth/signup", handler: signupController },
  { method: "POST", path: "/auth/login", handler: loginController },
  { method: "GET", path: "/analysis", handler: listAnalysesController },
  { method: "PATCH", path: "/analysis/read", handler: markReadController },
  { method: "DELETE", path: "/analysis", handler: clearAnalysesController },
  { method: "POST", path: "/analysis/flush", handler: flushNowController },
  { method: "POST", path: "/events", handler: addEventController },
  { method: "GET", path: "/events", handler: getQueueStatsController },
  {
    method: "GET",
    path: "/simulated-data",
    handler: getSimulatedDataController,
  },
  {
    method: "POST",
    path: "/events/analyze",
    handler: analyzeEventsController,
  },
] as const;
