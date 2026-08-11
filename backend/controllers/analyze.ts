import { z } from "zod";
import { analyzeEvents } from "../lib/analyzer";
import { logger } from "../logger/logger";
import { analyzeRequestSchema } from "../schema/analyze.schema";

export async function analyzeEventsController(req: Request) {
  try {
    const body = analyzeRequestSchema.parse(await req.json());

    const analysis = await analyzeEvents(body.events, {
      focus: body.instructions,
    });

    return Response.json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(error.flatten(), { status: 400 });
    }

    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to analyze events",
    );

    return Response.json(
      { message: "Failed to analyze events" },
      { status: 500 },
    );
  }
}
