import { z } from "zod";

export const agentMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(8000),
  history: z.array(agentMessageSchema).max(50).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
