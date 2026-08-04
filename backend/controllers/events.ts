import { z } from "zod";

import { addEventJob, getEventQueueCounts } from "../lib/queue";

export async function addEventController(req: Request) {
  try {
    const { jobId } = await addEventJob(await req.json());
    return Response.json({ jobId }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(error.flatten(), { status: 400 });
    }

    return Response.json({ message: "Failed to add job" }, { status: 500 });
  }
}

export async function getQueueStatsController() {
  return Response.json(await getEventQueueCounts());
}
