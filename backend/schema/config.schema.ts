import { z } from "zod";

export enum NodeEnv {
  Development = "development",
  Production = "production",
}

export const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(9095),

  NODE_ENV: z
    .enum([NodeEnv.Development, NodeEnv.Production])
    .default(NodeEnv.Development),

  CORS_ORIGINS: z.string().optional(),

  REDIS_URL: z.string().url(),

  REDIS_PASSWORD: z.string().optional(),

  DEEPSEEK_API_KEY: z.string().optional(),

  DEEPSEEK_MODEL: z.string().default("deepseek-v4-flash"),
});

export type Env = z.infer<typeof configSchema>;
