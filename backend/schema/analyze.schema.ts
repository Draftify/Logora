import { z } from "zod";
import { eventSchema } from "./event.schema";

export const analyzeRequestSchema = z.object({
  events: z.array(eventSchema).min(1).max(500),
  instructions: z.string().max(2000).optional(),
});

export const analysisSchema = z.object({
  summary: z
    .string()
    .describe("A concise 2-3 sentence summary of what the data shows"),

  insights: z
    .array(z.string())
    .describe("Notable patterns, trends, or observations found in the data"),

  risks: z
    .array(
      z.object({
        severity: z.enum(["low", "medium", "high", "critical"]),
        description: z.string(),
        affectedItems: z.array(z.string()).optional(),
      }),
    )
    .describe("Risks, anomalies, or problems detected in the data"),

  recommendations: z
    .array(z.string())
    .describe("Concrete, actionable next steps"),
});

export type Analysis = z.infer<typeof analysisSchema>;
