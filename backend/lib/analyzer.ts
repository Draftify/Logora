import { ChatDeepSeek } from "@langchain/deepseek";
import { z } from "zod";

import { config } from "../config/config";
import { logger } from "../logger/logger";
import type { EventPayload } from "../schema/event.schema";

/**
 * Shape of the structured analysis returned by DeepSeek.
 */
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

        description: z.string().describe("What the risk or anomaly is"),

        affectedItems: z
          .array(z.string())
          .optional()
          .describe(
            "Identifiers of the involved items, e.g. userId, orderId, IP",
          ),
      }),
    )
    .describe("Risks, anomalies, or problems detected in the data"),

  recommendations: z
    .array(z.string())
    .describe("Concrete, actionable next steps"),
});

export type Analysis = z.infer<typeof analysisSchema>;

export interface AnalyzeOptions {
  /**
   * DeepSeek model name:
   * "deepseek-chat", "deepseek-reasoner", "deepseek-v4-flash", etc.
   */
  model?: string;

  /**
   * Sampling temperature.
   * Lower values produce more deterministic output.
   */
  temperature?: number;

  /**
   * Extra instructions describing what the analysis should focus on.
   */
  focus?: string;

  /**
   * Extra context included in the prompt.
   */
  context?: string;

  /**
   * Maximum number of items sent to the model.
   * Defaults to 200.
   */
  maxItems?: number;
}

const DEFAULT_MAX_ITEMS = 200;

/**
 * Creates the DeepSeek model.
 *
 * We intentionally do NOT use withStructuredOutput() here.
 *
 * DeepSeek thinking/reasoning models such as deepseek-v4-flash
 * may reject LangChain tool-calling with:
 *
 * "Thinking mode does not support this tool_choice"
 *
 * Instead, we request JSON directly and validate it ourselves
 * using Zod.
 */
export function createDeepSeekModel(
  options: Pick<AnalyzeOptions, "model" | "temperature"> = {},
) {
  if (!config.deepSeekApiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set. Add it to backend/.env.");
  }

  return new ChatDeepSeek({
    apiKey: config.deepSeekApiKey,

    model: options.model ?? config.deepSeekModel,

    temperature: options.temperature ?? 0.2,

    maxRetries: 2,

    timeout: 120_000,
  });
}

/**
 * Converts LangChain response content into a string.
 */
function contentToString(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (typeof item === "object" && item !== null && "text" in item) {
          return String((item as { text?: unknown }).text ?? "");
        }

        return JSON.stringify(item);
      })
      .join("");
  }

  return JSON.stringify(content);
}

/**
 * Extracts the first valid JSON object from model output.
 *
 * Handles:
 * - Plain JSON
 * - ```json ... ```
 * - Extra text before/after JSON
 */
function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  /**
   * First try parsing the entire response.
   */
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue with object extraction.
  }

  /**
   * Find the first JSON object.
   */
  const start = cleaned.indexOf("{");

  if (start === -1) {
    throw new Error(
      `No JSON object found in model output. Output: ${cleaned.slice(0, 1000)}`,
    );
  }

  /**
   * Find the matching closing brace.
   *
   * This is safer than simply using lastIndexOf("}")
   * when the model includes extra content.
   */
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i += 1) {
    const char = cleaned[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        const jsonText = cleaned.slice(start, i + 1);

        try {
          return JSON.parse(jsonText);
        } catch (error) {
          throw new Error(
            `Failed to parse extracted JSON: ${
              error instanceof Error ? error.message : String(error)
            }\nJSON: ${jsonText.slice(0, 2000)}`,
          );
        }
      }
    }
  }

  throw new Error(
    `Incomplete JSON object in model output: ${cleaned.slice(
      start,
      start + 2000,
    )}`,
  );
}

/**
 * The exact structure we want DeepSeek to return.
 *
 * This is intentionally explicit instead of only passing
 * Zod descriptions to the model.
 */
function buildOutputExample() {
  return {
    summary: "A concise 2-3 sentence summary of what the data shows.",

    insights: ["Important pattern, trend, or observation from the data."],

    risks: [
      {
        severity: "high",
        description: "Description of the detected risk or anomaly.",
        affectedItems: ["Optional identifiers such as userId, orderId, IP"],
      },
    ],

    recommendations: ["Concrete and actionable next step."],
  };
}

/**
 * Builds the system prompt.
 */
function buildSystemPrompt(): string {
  return [
    "You are a senior data analyst and security event analyst.",

    "You receive a JSON array of records and must analyze them rigorously.",

    "Your analysis must be evidence-based.",

    "Reference actual values, identifiers, services, event types, IPs, users, counts, and other information present in the data.",

    "Never invent data or claim something that cannot be supported by the provided records.",

    "",

    "IMPORTANT OUTPUT RULES:",

    "Return ONLY one valid JSON object.",

    "Do NOT use markdown.",

    "Do NOT use code fences.",

    "Do NOT add explanations outside the JSON object.",

    "Do NOT wrap the result inside an 'analysis' property.",

    "Do NOT return fields such as 'events', 'correlations', or 'securityAssessment'.",

    "The root object MUST contain exactly these fields:",
    "- summary",
    "- insights",
    "- risks",
    "- recommendations",

    "summary MUST be a string.",

    "insights MUST be an array of strings.",

    "risks MUST be an array of objects.",

    "Each risk MUST contain severity and description.",

    "severity MUST be one of: low, medium, high, critical.",

    "affectedItems MAY be included as an array of strings.",

    "recommendations MUST be an array of strings.",

    "If there are no insights, risks, or recommendations, return an empty array.",

    "Do not return null for any required field.",
  ].join("\n");
}

/**
 * Builds the user prompt.
 */
function buildUserPrompt<T>(
  data: T[],
  options: AnalyzeOptions,
  slice: T[],
  isTruncated: boolean,
): string {
  const outputExample = buildOutputExample();

  return [
    `Analyze the following ${data.length} item(s).`,

    options.focus ? `Focus specifically on: ${options.focus}` : null,

    isTruncated
      ? `Only the first ${
          options.maxItems ?? DEFAULT_MAX_ITEMS
        } items are included in this analysis because the dataset was truncated.`
      : null,

    options.context ? `Additional context:\n${options.context}` : null,

    "",

    "Required output structure:",

    JSON.stringify(outputExample, null, 2),

    "",

    "Important:",
    "- Do not copy the example values.",
    "- Replace them with findings based on the actual data.",
    "- Keep the exact field structure.",
    "- Do not add an 'analysis' wrapper.",
    "- Do not add extra fields.",
    "- Use empty arrays when there are no findings.",

    "",

    "DATA:",

    JSON.stringify(slice, null, 2),
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Sends an array of records to DeepSeek and returns
 * a validated structured analysis.
 *
 * Flow:
 *
 * Data
 *   ↓
 * Prompt
 *   ↓
 * DeepSeek
 *   ↓
 * JSON extraction
 *   ↓
 * Zod validation
 *   ↓
 * Analysis
 */
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

  const modelName = options.model ?? config.deepSeekModel;

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

    logger.debug(
      {
        responseLength: rawResponse.length,
      },
      "Received DeepSeek analysis response",
    );

    const parsedJson = extractJson(rawResponse);

    /**
     * Validate the model response against the actual
     * application schema.
     */
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

    logger.info(
      {
        insights: result.data.insights.length,
        risks: result.data.risks.length,
        recommendations: result.data.recommendations.length,
      },
      "Successfully analyzed data with DeepSeek",
    );

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

/**
 * Precomputed aggregates for a batch of events.
 */
export interface EventStats {
  total: number;
  services: Record<string, number>;
  events: Record<string, number>;
  users: Record<string, number>;
  securityRelated: number;
}

const SECURITY_EVENT_PATTERN =
  /security|fraud|brute|abuse|lock|blocked|rate_limit|unauthorized|scan|escalation|chargeback|declined|refund|impossible/i;

/**
 * Calculates aggregate statistics for events.
 */
export function summarizeEvents(events: EventPayload[]): EventStats {
  const stats: EventStats = {
    total: events.length,
    services: {},
    events: {},
    users: {},
    securityRelated: 0,
  };

  for (const event of events) {
    stats.services[event.service] = (stats.services[event.service] ?? 0) + 1;

    stats.events[event.event] = (stats.events[event.event] ?? 0) + 1;

    const userId = (
      event.data as
        | {
            userId?: string;
          }
        | undefined
    )?.userId;

    if (userId) {
      stats.users[userId] = (stats.users[userId] ?? 0) + 1;
    }

    if (SECURITY_EVENT_PATTERN.test(event.event)) {
      stats.securityRelated += 1;
    }
  }

  return stats;
}

/**
 * Convenience wrapper around analyzeData tailored
 * to EventPayload objects.
 */
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
