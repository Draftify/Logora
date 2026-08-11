import type { AnalyzeOptions } from "../types/analyzer.types";

export function buildOutputExample() {
  return {
    summary: "Brief summary of the most important finding.",
    insights: ["Short, evidence-based key observation."],
    risks: [
      {
        severity: "high",
        description: "Short description of a significant risk.",
        affectedItems: ["Relevant identifier"],
      },
    ],
    recommendations: ["Short, actionable recommendation."],
  };
}

export function buildSystemPrompt(): string {
  return [
    "You are a senior data analyst and security event analyst.",
    "You receive a JSON array of records and must analyze them rigorously.",
    "Your analysis must be evidence-based and supported only by the provided data.",
    "Reference actual values, identifiers, services, event types, IPs, users, counts, and other relevant information present in the data.",
    "Never invent data or make unsupported claims.",
    "",
    "ANALYSIS PRIORITY:",
    "Focus only on the most important and actionable findings.",
    "Be concise. Avoid repetition, background explanation, and low-value observations.",
    "Prioritize security issues, anomalies, suspicious activity, failures, unusual patterns, and significant operational risks.",
    "",
    "RISK RULES:",
    "Return ONLY risks with severity 'high' or 'critical'.",
    "NEVER return low or medium risks.",
    "If a risk is low or medium severity, omit it completely.",
    "Only include a risk when it is clearly supported by the provided records.",
    "Recommendations should only address high or critical risks.",
    "",
    "SUMMARY RULES:",
    "summary MUST be extremely short.",
    "summary MUST be one sentence only.",
    "Prefer 10-20 words.",
    "Summarize only the most important overall finding.",
    "",
    "INSIGHT RULES:",
    "insights MUST contain only important findings.",
    "Keep each insight to one short sentence.",
    "Do not include trivial observations.",
    "If there are no important insights, return an empty array.",
    "",
    "RECOMMENDATION RULES:",
    "Recommendations MUST be short, concrete, and actionable.",
    "Only provide recommendations for high or critical risks.",
    "If there are no high or critical risks, return an empty array.",
    "",
    "IMPORTANT OUTPUT RULES:",
    "Return ONLY one valid JSON object.",
    "Do NOT use markdown.",
    "Do NOT use code fences.",
    "Do NOT add explanations outside the JSON object.",
    "Do NOT wrap the result inside an 'analysis' property.",
    "Do NOT return extra fields.",
    "The root object MUST contain exactly these fields:",
    "- summary",
    "- insights",
    "- risks",
    "- recommendations",
    "",
    "summary MUST be a string.",
    "insights MUST be an array of strings.",
    "risks MUST be an array of objects.",
    "Each risk MUST contain severity and description.",
    "severity MUST be one of: high, critical.",
    "affectedItems MAY be included as an array of strings.",
    "recommendations MUST be an array of strings.",
    "If there are no findings, return empty arrays.",
    "Do not return null for any required field.",
  ].join("\n");
}

export function buildUserPrompt<T>(
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
          options.maxItems
        } items are included because the dataset was truncated.`
      : null,

    options.context ? `Additional context:\n${options.context}` : null,

    "",

    "Return a concise result using exactly this structure:",

    JSON.stringify(outputExample, null, 2),

    "",

    "Important:",
    "- Do not copy the example values.",
    "- Use only findings supported by the actual data.",
    "- Keep the summary to one short sentence.",
    "- Include only important insights.",
    "- Include ONLY high or critical risks.",
    "- NEVER include low or medium risks.",
    "- Recommendations are required only for high or critical risks.",
    "- Use empty arrays when there are no qualifying findings.",
    "- Do not add an 'analysis' wrapper.",
    "- Do not add extra fields.",

    "",

    "DATA:",

    JSON.stringify(slice, null, 2),
  ]
    .filter(Boolean)
    .join("\n");
}
