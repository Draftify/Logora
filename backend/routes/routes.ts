import {
  addEventController,
  getQueueStatsController,
} from "../controllers/events";
import { analyzeEventsController } from "../controllers/analyze";
import { getSimulatedDataController } from "../controllers/data";
import { healthController } from "../controllers/health";
import {
  signupController,
  loginController,
  meController,
  logoutController,
} from "../controllers/auth";
import {
  listAnalysesController,
  markReadController,
  clearAnalysesController,
  flushNowController,
} from "../controllers/analysis";

export type RouteHandler = (req: Request) => Response | Promise<Response>;

// Routes without `auth: true` are public (signup/login/health).
// Everything else requires a valid Bearer token.
export const routes = [
  // Public
  { method: "GET", path: "/health", handler: healthController },
  { method: "POST", path: "/auth/signup", handler: signupController },
  { method: "POST", path: "/auth/login", handler: loginController },

  // Protected
  {
    method: "GET",
    path: "/auth/me",
    handler: meController,
    auth: true,
  },
  {
    method: "POST",
    path: "/auth/logout",
    handler: logoutController,
    auth: true,
  },
  {
    method: "GET",
    path: "/analysis",
    handler: listAnalysesController,
    auth: true,
  },
  {
    method: "PATCH",
    path: "/analysis/read",
    handler: markReadController,
    auth: true,
  },
  {
    method: "DELETE",
    path: "/analysis",
    handler: clearAnalysesController,
    auth: true,
  },
  {
    method: "POST",
    path: "/analysis/flush",
    handler: flushNowController,
    auth: true,
  },
  { method: "POST", path: "/events", handler: addEventController, auth: true },
  {
    method: "GET",
    path: "/events",
    handler: getQueueStatsController,
    auth: true,
  },
  {
    method: "GET",
    path: "/simulated-data",
    handler: getSimulatedDataController,
    auth: true,
  },
  {
    method: "POST",
    path: "/events/analyze",
    handler: analyzeEventsController,
    auth: true,
  },
] as const;
