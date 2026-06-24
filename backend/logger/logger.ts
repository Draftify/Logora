import pino from "pino";
import { config } from "../config/config";
import { NodeEnv } from "../config/config.schema";

const isDev = config.nodeEnv === NodeEnv.Development;

export const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,

  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
