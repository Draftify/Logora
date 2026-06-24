import { healthController } from "../controllers/health";

export const routes = [
  {
    path: "/health",
    handler: healthController,
  },
];
