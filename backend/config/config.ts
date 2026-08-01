import { configSchema } from "./config.schema";

const parsedEnv = configSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsedEnv.data;

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  corsOrigins: env.CORS_ORIGINS?.split(",") ?? [],
} as const;
