import { z } from "zod";

export const eventSchema = z.object({
  service: z.string().min(1),
  event: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export type EventPayload = z.infer<typeof eventSchema>;
