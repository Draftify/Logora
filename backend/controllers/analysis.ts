import { logger } from "../logger/logger";
import { listAnalyses, markAsRead, clearAnalyses } from "../lib/analysis.store";
import { flushBuffer } from "../lib/batch.analyzer";

export async function listAnalysesController(): Promise<Response> {
  try {
    const analyses = await listAnalyses();
    return Response.json(analyses);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to list analyses",
    );
    return Response.json(
      { message: "Failed to retrieve analyses" },
      { status: 500 },
    );
  }
}

export async function markReadController(req: Request): Promise<Response> {
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) {
      return Response.json({ message: "Missing analysis id" }, { status: 400 });
    }

    const found = await markAsRead(id);
    if (!found) {
      return Response.json({ message: "Analysis not found" }, { status: 404 });
    }

    return Response.json({ id, read: true });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to mark analysis as read",
    );
    return Response.json(
      { message: "Failed to update analysis" },
      { status: 500 },
    );
  }
}

export async function clearAnalysesController(): Promise<Response> {
  try {
    const count = await clearAnalyses();
    return Response.json({ cleared: count });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to clear analyses",
    );
    return Response.json(
      { message: "Failed to clear analyses" },
      { status: 500 },
    );
  }
}

export async function flushNowController(): Promise<Response> {
  try {
    await flushBuffer();
    return Response.json({ status: "flush completed" });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to flush buffer",
    );
    return Response.json(
      { message: "Failed to flush buffer" },
      { status: 500 },
    );
  }
}
