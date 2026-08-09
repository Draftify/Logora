import { z } from "zod";
import { eventSchema } from "./event.schema";

export const analyzeRequestSchema = z.object({
  events: z.array(eventSchema).min(1).max(500),
  instructions: z.string().max(2000).optional(),
});
