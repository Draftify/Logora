import { z } from "zod";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { logger } from "../logger/logger";
import { chatRequestSchema } from "../schema/agent.schema";
import { createDeepSeekModel } from "../model/analyzer.model";
import { contentToString } from "../utils/analyzer.json";

const SYSTEM_PROMPT = [
  "You are the Logora Agent, a concise and helpful assistant for the Logora event-analytics platform.",
  "You help users understand their event pipeline, queue, AI-generated analyses, risks, and recommendations.",
  "Answer questions clearly and briefly. Use short paragraphs and simple markdown when it helps.",
  "If you are asked about data you cannot see, say so instead of guessing.",
].join("\n");

export async function chatController(req: Request): Promise<Response> {
  try {
    const body = chatRequestSchema.parse(await req.json());

    const model = createDeepSeekModel({ temperature: 0.4 });

    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...(body.history ?? []).map((message) =>
        message.role === "assistant"
          ? new AIMessage(message.content)
          : new HumanMessage(message.content),
      ),
      new HumanMessage(body.message),
    ];

    const reply = await model.invoke(messages);

    return Response.json({ reply: contentToString(reply.content) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(error.flatten(), { status: 400 });
    }

    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Agent chat failed",
    );

    return Response.json(
      { message: "Failed to get a response from the agent" },
      { status: 500 },
    );
  }
}
