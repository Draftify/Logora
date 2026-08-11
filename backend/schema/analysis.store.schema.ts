import { z } from "zod";

export const storedAnalysisSchema = z.object({
  id: z.string(),
  summary: z.string(),
  insights: z.array(z.string()),
  risks: z.array(
    z.object({
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string(),
      affectedItems: z.array(z.string()).optional(),
    }),
  ),
  recommendations: z.array(z.string()),
  eventCount: z.number(),
  createdAt: z.string(),
  read: z.boolean(),
});

export type StoredAnalysis = z.infer<typeof storedAnalysisSchema>;
