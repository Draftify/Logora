export function contentToString(content: unknown): string {
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

export function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue with object extraction.
  }

  const start = cleaned.indexOf("{");

  if (start === -1) {
    throw new Error(
      `No JSON object found in model output. Output: ${cleaned.slice(0, 1000)}`,
    );
  }

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
