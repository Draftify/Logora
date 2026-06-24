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

  DATABASE_URL: z.url(),

  DATABASE_USERNAME: z.string().min(1),

  DATABASE_PASSWORD: z.string().min(1),
});

export type Env = z.infer<typeof configSchema>;
