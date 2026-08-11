import { ChatDeepSeek } from "@langchain/deepseek";

import { config } from "../config/config";
import type { AnalyzeOptions } from "../types/analyzer.types";

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
