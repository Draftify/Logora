import { logger } from "../logger/logger";
import type { EventPayload } from "../schema/event.schema";
import {
  DEFAULT_MAX_ITEMS,
  type AnalyzeOptions,
} from "../types/analyzer.types";
import { analysisSchema, type Analysis } from "../schema/analyze.schema";
import { createDeepSeekModel } from "../model/analyzer.model";
import {
  buildSystemPrompt,
  buildUserPrompt,
} from "../prompts/analyzer.prompts";
import { contentToString, extractJson } from "../utils/analyzer.json";
import { summarizeEvents } from "../stats/analyzer.stats";

export async function analyzeData<T>(
  data: T[],
  options: AnalyzeOptions = {},
): Promise<Analysis> {
  if (data.length === 0) {
    throw new Error("analyzeData requires at least one item");
  }

  const maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS;
  const isTruncated = data.length > maxItems;
  const slice = data.slice(0, maxItems);

  const modelName = options.model ?? "default";

  logger.info(
    {
      itemCount: data.length,
      itemsSent: slice.length,
      truncated: isTruncated,
      model: modelName,
    },
    "Analyzing data with DeepSeek",
  );

  const model = createDeepSeekModel(options);

  const systemPrompt = buildSystemPrompt();

  const userPrompt = buildUserPrompt(data, options, slice, isTruncated);

  try {
    const reply = await model.invoke([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "human",
        content: userPrompt,
      },
    ]);

    const rawResponse = contentToString(reply.content);

    const parsedJson = extractJson(rawResponse);

    const result = analysisSchema.safeParse(parsedJson);

    if (!result.success) {
      logger.error(
        {
          validationErrors: result.error.issues,
          response: rawResponse.slice(0, 5000),
        },
        "DeepSeek returned invalid analysis structure",
      );

      throw new Error(
        `Invalid analysis response from DeepSeek: ${result.error.message}`,
      );
    }

    return result.data;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to analyze data",
    );

    throw error;
  }
}

export async function analyzeEvents(
  events: EventPayload[],
  options: Omit<AnalyzeOptions, "context"> = {},
): Promise<Analysis> {
  if (events.length === 0) {
    throw new Error("analyzeEvents requires at least one event");
  }

  const stats = summarizeEvents(events);

  return analyzeData(events, {
    ...options,

    context: [
      "Aggregates computed from the data:",
      JSON.stringify(stats, null, 2),
    ].join("\n"),

    focus:
      options.focus ??
      [
        "Detect security incidents, fraud patterns,",
        "operational failures, and user-experience problems.",
        "Group related events into incident narratives where applicable.",
        "Identify correlations using shared identifiers such as",
        "IP addresses, user IDs, order IDs, service names,",
        "event types, and timestamps.",
      ].join(" "),
  });
}
