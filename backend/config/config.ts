import { configSchema } from "../schema/config.schema";

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
  redisUrl: env.REDIS_URL,
  redisPassword: env.REDIS_PASSWORD,
  deepSeekApiKey: env.DEEPSEEK_API_KEY,
  deepSeekModel: env.DEEPSEEK_MODEL,
} as const;
